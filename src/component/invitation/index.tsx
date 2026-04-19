import {
  BRIDE_FULLNAME,
  BRIDE_FATHER,
  BRIDE_MOTHER,
  GROOM_FULLNAME,
  GROOM_FATHER,
  GROOM_MOTHER,
  GROOM_TITLE,
  BRIDE_TITLE,
} from "../../const"
import { LazyDiv } from "../lazyDiv"

const formatParents = (parent1: string, parent2: string) => {
  return [parent1, parent2].filter(Boolean).join(" · ")
}

export const Invitation = () => {
  return (
    <LazyDiv className="card invitation">
      <h2 className="english">Invitation</h2>

      <div className="intro-band">
        <div className="intro-heading">우리의 결혼식에 초대합니다.</div>
      </div>

      <div className="poem">
        <div className="content">묘목이 자라면</div>
        <div className="content">사랑이 주렁주렁 맺힐거예요</div>
        <div className="content">우주를 마시고 단단해질 겁니다</div>
        <div className="break" />
        <div className="content">그것이 열리기를 기다리는 동안</div>
        <div className="content">당신은 마음에서 돌을 꺼내 내게 주세요</div>
        <div className="content">나는 그것을 깨뜨려 별사탕으로 만들 줄 압니다</div>
        <div className="break" />
        <div className="content citation">- &lt;별사탕과 연금술사&gt; 중, 고선경 저</div>
      </div>

      <div className="break" />

      <div className="name first-name">
        {formatParents(GROOM_FATHER, GROOM_MOTHER)}
        <span className="relation">
          의 <span className="relation-name">{GROOM_TITLE}</span>
        </span>{" "}
        {GROOM_FULLNAME}
      </div>
      <div className="name second-name">
        {formatParents(BRIDE_FATHER, BRIDE_MOTHER)}
        <span className="relation">
          의 <span className="relation-name">{BRIDE_TITLE}</span>
        </span>{" "}
        {BRIDE_FULLNAME}
      </div>
    </LazyDiv>
  )
}
