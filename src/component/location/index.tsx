import { Map } from "./map"
import CarIcon from "../../icons/car-icon.svg?react"
import BusIcon from "../../icons/bus-icon.svg?react"
import { LazyDiv } from "../lazyDiv"
import { LOCATION, LOCATION_ADDRESS } from "../../const"

export const Location = () => {
  return (
    <>
      <LazyDiv className="card location">
        <h2 className="english">Location</h2>
        <div className="addr">
          {LOCATION}
          <div className="detail">{LOCATION_ADDRESS}</div>
        </div>
        <Map />
      </LazyDiv>
      <LazyDiv className="card location">
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <BusIcon className="transportation-icon" />
          </div>
          <div className="heading">대중교통</div>
          <div />
          <div className="content">
            * 지하철 이용 시 (셔틀버스 탑승)
            <br />
            1. 지하철 <b>수서역 4번 출구</b> 직진
            <br />
            → 투썸플레이스(수서타워) 끼고 좌회전
            <br />
            → 맞은편 <b>노란색 셔틀버스</b> 탑승
          </div>
          <div />
          <div className="content">
            2. <b>SRT 수서역 1번 출구</b> 도보 30m 직진 후 우회전
            <br />
            → 기아서비스 맞은편 <b>노란색 셔틀버스</b> 탑승
            <br />
            * 예식 1시간 전부터 <b>10~15분 간격</b>으로 셔틀 운행
          </div>
          <div />
          <div className="content">
            * 버스 이용 시
            <br />
            <b>강남한양수자인 APT 정류장</b> 하차
            <br />
            → 도보 10분 내외
            <br />
            지선 <b>3426</b>, 간선 <b>402</b>
          </div>
        </div>
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <CarIcon className="transportation-icon" />
          </div>
          <div className="heading">자가용</div>
          <div />
          <div className="content">
            * 무료 하객 전용 주차장
            <br />
            <b>송파구 충민로 10</b> (문정동)
            <br />
            <b>가든5</b> 서측(e-mart) 입구
            <br />
            → <b>B5층 B구역</b> 주차 후 1층 이동
          </div>
          <div />
          <div className="content">
            * 셔틀버스 이용 시
            <br />
            <b>5번/6번 gate</b> 출구 앞
            <b> 노란색 셔틀버스 </b>
            탑승 (셔틀버스 약 3분 거리)
          </div>
        </div>
      </LazyDiv>
    </>
  )
}
