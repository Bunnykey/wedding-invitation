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
          <div className="heading">셔틀버스</div>
          <div />
          <div className="content">
            * 예식 1시간 전부터 <b>10~15분 간격</b>으로 운행
            <br />
            - 지하철 <b>수서역 4번 출구</b> {">"} 직진 후 투썸플레이스를 끼고
            좌회전 {">"} 맞은편 노란색 셔틀 버스 탑승
            <br />
            - <b>SRT 수서역 1번 출구</b> {">"} 30m 직진 후 우회전 {">"} 기아오토큐
            수서서비스 맞은편 노란색 셔틀 버스 탑승
          </div>
        </div>
        <div className="location-info">
          <div className="transportation-icon-wrapper">
            <CarIcon className="transportation-icon" />
          </div>
          <div className="heading">자가용</div>
          <div />
          <div className="content">
            - <b>밤고개로21길 공영주차장</b>(서울 강남구 율현동 527) 주차
            <br />
            - <b>가든5</b> 서측(e-mart) 입구 <b>B5층 B구역</b> 주차 {">"} 1층
            <b> 5번/6번 gate</b> 출구 앞 셔틀 버스 탑승
          </div>
        </div>
      </LazyDiv>
    </>
  )
}
