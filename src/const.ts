import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/ko"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("ko")

export { dayjs }

export const WEDDING_DATE = dayjs.tz("2026-08-15 13:30", "Asia/Seoul")
export const WEDDING_DATE_FORMAT = `YYYY년 MMMM D일 dddd A h시${WEDDING_DATE.minute() === 0 ? "" : " m분"}`

// 예식 당월 휴무일. 켈린더에 표시하기 위함.
// 예: 예식일 8월 -> 8월 15일 광복절
export const HOLIDAYS = [15]

export const LOCATION = "빌라드지디 수서"
export const LOCATION_ADDRESS = "서울특별시 강남구 밤고개로21길 79"

export const SHARE_ADDRESS = LOCATION
export const SHARE_ADDRESS_TITLE = LOCATION

// 네이버 지도 및 카카오 네비게이션에 사용할 좌표. [경도, 위도] 형식.
// 빌라드지디 수서 좌표
export const WEDDING_HALL_POSITION = [127.1150996, 37.4741471]

// 네이버 지도의 웨딩홀 장소 ID
// TODO: 네이버지도에서 빌라드지디 수서 검색 후 URL에서 확인
export const NMAP_PLACE_ID = 1966109955

// 카카오 지도의 웨딩홀 장소 ID
// TODO: 카카오지도에서 빌라드지디 수서 검색 후 URL에서 확인
export const KMAP_PLACE_ID = 1804498588

export const BRIDE_FULLNAME = "채나율"
export const BRIDE_FIRSTNAME = "나율"
export const BRIDE_TITLE = "딸"
export const BRIDE_FATHER = ""
export const BRIDE_MOTHER = "채문희"
export const BRIDE_INFO = [
  {
    relation: "신부",
    name: BRIDE_FULLNAME,
    phone: "010-0000-0000",
    account: "국민은행 000000000000",
  },
  {
    relation: "신부 어머니",
    name: BRIDE_MOTHER,
    phone: "010-0000-0000",
    account: "신한은행 000000000000",
  },
]

export const GROOM_FULLNAME = "용환웅"
export const GROOM_FIRSTNAME = "환웅"
export const GROOM_TITLE = "아들"
export const GROOM_FATHER = "용윤식"
export const GROOM_MOTHER = "정소라"
export const GROOM_INFO = [
  {
    relation: "신랑",
    name: GROOM_FULLNAME,
    phone: "010-0000-0000",
    account: "우리은행 000000000000",
  },
  {
    relation: "신랑 아버지",
    name: GROOM_FATHER,
    phone: "010-0000-0000",
    account: "농협은행 000000000000",
  },
  {
    relation: "신랑 어머니",
    name: GROOM_MOTHER,
    phone: "010-0000-0000",
    account: "하나은행 000000000000",
  },
]
