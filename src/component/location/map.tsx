import { useEffect, useState, useRef } from "react"
import { useKakao, useNaver } from "../store"
import nmapIcon from "../../icons/nmap-icon.png"
import knaviIcon from "../../icons/knavi-icon.png"
import tmapIcon from "../../icons/tmap-icon.png"
import LockIcon from "../../icons/lock-icon.svg?react"
import UnlockIcon from "../../icons/unlock-icon.svg?react"
import {
  KMAP_PLACE_ID,
  LOCATION,
  NMAP_APP_NAME,
  WEDDING_HALL_POSITION,
} from "../../const"
import { NAVER_MAP_CLIENT_ID } from "../../env"

export const Map = () => {
  const naver = useNaver()
  const kakao = useKakao()
  const ref = useRef<HTMLDivElement>(null)
  const [locked, setLocked] = useState(true)
  const [showLockMessage, setShowLockMessage] = useState(false)
  const [mapLoadFailed, setMapLoadFailed] = useState(false)
  const lockMessageTimeout = useRef<number | null>(null)
  const hasNaverMapKey = !!NAVER_MAP_CLIENT_ID
  const canRenderNaverMap = !!naver?.maps?.Map
  const shouldShowMapFallback =
    !hasNaverMapKey || mapLoadFailed || (!!naver && !canRenderNaverMap)

  const checkDevice = () => {
    const userAgent = window.navigator.userAgent
    if (userAgent.match(/(iPhone|iPod|iPad)/)) {
      return "ios"
    } else if (userAgent.match(/(Android)/)) {
      return "android"
    } else {
      return "other"
    }
  }

  const openWithFallback = (
    appUrl: string,
    fallback: (() => void) | string,
    timeout = 900,
  ) => {
    let handled = false

    const cleanup = () => {
      window.removeEventListener("blur", onHandled)
      document.removeEventListener("visibilitychange", onVisibility)
    }

    const onHandled = () => {
      handled = true
      cleanup()
    }

    const onVisibility = () => {
      if (document.hidden) {
        handled = true
        cleanup()
      }
    }

    window.addEventListener("blur", onHandled)
    document.addEventListener("visibilitychange", onVisibility)
    window.location.href = appUrl

    window.setTimeout(() => {
      cleanup()
      if (handled) return

      if (typeof fallback === "string") {
        window.open(fallback, "_blank")
      } else {
        fallback()
      }
    }, timeout)
  }

  const openNaverMap = () => {
    const webUrl = `https://map.naver.com/p/search/${encodeURIComponent(LOCATION)}`

    switch (checkDevice()) {
      case "ios":
      case "android": {
        // 공백은 %20으로 인코딩한다. URLSearchParams는 +로 인코딩해 앱에서 장소명이 깨진다.
        const appUrl =
          `nmap://place?lat=${WEDDING_HALL_POSITION[1]}` +
          `&lng=${WEDDING_HALL_POSITION[0]}` +
          `&name=${encodeURIComponent(LOCATION)}` +
          `&appname=${NMAP_APP_NAME}`
        openWithFallback(appUrl, webUrl)
        break
      }
      default:
        window.open(webUrl, "_blank")
        break
    }
  }

  const openKakaoNavi = () => {
    const webUrl = `https://map.kakao.com/link/map/${KMAP_PLACE_ID}`

    switch (checkDevice()) {
      case "ios":
      case "android":
        if (kakao?.Navi) {
          try {
            kakao.Navi.start({
              name: LOCATION,
              x: WEDDING_HALL_POSITION[0],
              y: WEDDING_HALL_POSITION[1],
              coordType: "wgs84",
            })
            return
          } catch {
            window.open(webUrl, "_blank")
            return
          }
        }
        window.open(webUrl, "_blank")
        break
      default:
        window.open(webUrl, "_blank")
        break
    }
  }

  const openTmap = () => {
    const params = new URLSearchParams({
      goalx: WEDDING_HALL_POSITION[0].toString(),
      goaly: WEDDING_HALL_POSITION[1].toString(),
      goalname: LOCATION,
    })

    switch (checkDevice()) {
      case "ios":
      case "android":
        openWithFallback(`tmap://route?${params.toString()}`, () => {
          alert(
            "티맵 앱이 설치되어 있지 않거나 인앱브라우저 제한으로 열리지 않을 수 있습니다. 티맵 앱에서 '빌라드지디 수서'를 검색해주세요.",
          )
        })
        break
      default:
        alert("모바일에서 확인하실 수 있습니다.")
        break
    }
  }

  useEffect(() => {
    if (canRenderNaverMap && ref.current && !mapLoadFailed) {
      let map: { destroy: () => void } | null = null

      try {
        map = new naver.maps.Map(ref.current, {
          center: WEDDING_HALL_POSITION,
          zoom: 17,
        })

        new naver.maps.Marker({ position: WEDDING_HALL_POSITION, map })
      } catch {
        setMapLoadFailed(true)
      }

      if (!map) return

      return () => {
        map?.destroy()
      }
    }
  }, [canRenderNaverMap, mapLoadFailed, naver])

  return (
    <>
      <div className="map-wrapper">
        {!shouldShowMapFallback ? (
          <>
            {locked && (
              <div
                className="lock"
                onTouchStart={() => {
                  setShowLockMessage(true)
                  if (lockMessageTimeout.current !== null) {
                    clearTimeout(lockMessageTimeout.current)
                  }
                  lockMessageTimeout.current = setTimeout(
                    () => setShowLockMessage(false),
                    3000,
                  )
                }}
                onMouseDown={() => {
                  setShowLockMessage(true)
                  if (lockMessageTimeout.current !== null) {
                    clearTimeout(lockMessageTimeout.current)
                  }
                  lockMessageTimeout.current = setTimeout(
                    () => setShowLockMessage(false),
                    3000,
                  )
                }}
              >
                {showLockMessage && (
                  <div className="lock-message">
                    <LockIcon /> 자물쇠 버튼을 눌러
                    <br />
                    터치 잠금 해제 후 확대 및 이동해 주세요.
                  </div>
                )}
              </div>
            )}
            <button
              className={"lock-button" + (locked ? "" : " unlocked")}
              aria-label={locked ? "지도 터치 잠금 해제" : "지도 터치 잠금"}
              onClick={() => {
                if (lockMessageTimeout.current !== null) {
                  clearTimeout(lockMessageTimeout.current)
                }
                setShowLockMessage(false)
                setLocked((locked) => !locked)
              }}
            >
              {locked ? <LockIcon /> : <UnlockIcon />}
            </button>
            <div className="map-inner" ref={ref}></div>
          </>
        ) : (
          <div className="map-fallback">
            지도를 불러오지 못했습니다.
            <br />
            아래 버튼으로 길찾기는 확인하실 수 있습니다.
          </div>
        )}
      </div>
      <div className="navigation">
        <button onClick={openNaverMap}>
          <img src={nmapIcon} alt="naver-map-icon" />
          네이버 지도
        </button>
        <button onClick={openKakaoNavi}>
          <img src={knaviIcon} alt="kakao-navi-icon" />
          카카오 내비
        </button>
        <button onClick={openTmap}>
          <img src={tmapIcon} alt="t-map-icon" />
          티맵
        </button>
      </div>
    </>
  )
}
