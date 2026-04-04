import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import "dayjs/locale/ko"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("ko")

export { dayjs }

export const WEDDING_DATE = dayjs.tz("2026-10-10 14:00", "Asia/Seoul")
export const WEDDING_DATE_FORMAT = `YYYY년 MMMM D일 dddd A h시${WEDDING_DATE.minute() === 0 ? "" : " m분"}`

// 예식 당월 휴무일. 켈린더에 표시하기 위함.
// 예: 예식일 10월 -> 10월 3일 개천절, 10월 9일 한글날
export const HOLIDAYS = [3, 9]

export const LOCATION = "그랜드 하얏트 서울 그랜드볼룸"
export const LOCATION_ADDRESS = "서울특별시 용산구 소월로 322"

export const SHARE_ADDRESS = LOCATION
export const SHARE_ADDRESS_TITLE = LOCATION

// 네이버 지도 및 카카오 네비게이션에 사용할 좌표. [경도, 위도] 형식.
export const WEDDING_HALL_POSITION = [126.9882, 37.5387]

// 네이버 지도의 웨딩홀 장소 ID
export const NMAP_PLACE_ID = 11583505

// 카카오 지도의 웨딩홀 장소 ID
export const KMAP_PLACE_ID = 7858602

export const BRIDE_FULLNAME = "김하늘"
export const BRIDE_FIRSTNAME = "하늘"
export const BRIDE_TITLE = "차녀"
export const BRIDE_FATHER = "김영수"
export const BRIDE_MOTHER = "이수진"
export const BRIDE_INFO = [
  {
    relation: "신부",
    name: BRIDE_FULLNAME,
    phone: "010-1234-5678",
    account: "국민은행 123456789012",
  },
  {
    relation: "신부 아버지",
    name: BRIDE_FATHER,
    phone: "010-2345-6789",
    account: "신한은행 987654321098",
  },
  {
    relation: "신부 어머니",
    name: BRIDE_MOTHER,
    phone: "010-3456-7890",
    account: "하나은행 111222333444",
  },
]

export const GROOM_FULLNAME = "박시우"
export const GROOM_FIRSTNAME = "시우"
export const GROOM_TITLE = "장남"
export const GROOM_FATHER = "박준혁"
export const GROOM_MOTHER = "최민지"
export const GROOM_INFO = [
  {
    relation: "신랑",
    name: GROOM_FULLNAME,
    phone: "010-4567-8901",
    account: "우리은행 555666777888",
  },
  {
    relation: "신랑 아버지",
    name: GROOM_FATHER,
    phone: "010-5678-9012",
    account: "농협은행 999888777666",
  },
  {
    relation: "신랑 어머니",
    name: GROOM_MOTHER,
    phone: "010-6789-0123",
    account: "기업은행 444333222111",
  },
]
