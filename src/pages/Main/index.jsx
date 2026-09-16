import HomeContentSections from "../../components/HomeContentSections";
import PoolSection from "../../components/PoolSection";

const staffLines = [
  "사람은백년남짓살다죽는다왜그렇게들서로조금씩다른것가지고뭐라들하는지어짜피죽으면다부질없는걸너네는너네들이탄배에나는우리들이탄배에남의배부여잡고흔들지말고각자의노나열심히저었으면만약배에서떨어져도다시올라탈게난너에게돌아가는사람햇빛옆에나란하게놓이는바람마음의높이를맞춰한걸음만더내디디면눈부신자리모두사라질텐데너의곁에잠시머무는게왜그리힘들었나그래도우린안녕이란말을닮아서오래오래반가울거야이렇게볕이좋은날엔나의사랑을전부들키게될거야한밤만더자고나면",
  "오늘처음보지만영원을함께해주실래요날아다니는새소리바람과함께춤추는파도소리푸른파도에거품이이는모양과이글거리는태양그리고이제밑으로들어가자는목소리첨벙하는소리에실려있는두려움은곧차분해지는심호흡과함께빠져든다푸른공허속에선오직나의숨소리만들린다숨을쉴때마다보글보글떠오르는물방울그속엔너에게첫눈에반했을때의순간이들어있다주변소음과배경공간과시간으로부터너와나는분리되고멈췄던나의심장과호흡소리와함께수많은꿈들이밀려온다그렇게나는숨가쁘게 유영하다가나는어느새너의앞에나의숨소리와심장소리가",
  "처음걷는길이다예쁘다조용하고햇빛도잘든다근데자꾸이길은길가에풀이부족하고사거리앞에심어진나무가한그루부족하고맨홀뚜껑이살짝틀어져무늬가뒤틀려맞지않고담장에누워하얀왼쪽앞발을핥다가갑자기나를쳐다보더니입질을멈추고야옹을두번울어주고다시앞발을핥아주어야하던검정고양이가없다길은아무잘못이없는데계속미워진다이길은틀린길이됐다길을미워하느라새로운풍경을한번도보지못했다상관없다또다시뒤를돌아본다그길이걷고싶다햇빛이너무잘드는게검은타일엔맞지않는데테이블을놓아둬야할곳도침대밑은안되는데빈틈이",
  "뭐든하나만해보고싶다1년이든2년이든다른건신경끄고그것만일어나서자기전까지그생각만하며지내는시간잘하고싶은것보단분산되지않은채로온전히몰입한끝에남는것을보고싶다그런걸할수있었던긴시간동안엔생각도들지않던게바쁜지금에서야떠오르는건바빠서일까지금현실적으로그렇게지속할수있는건일뿐이라고생각한다돈이해결되는것도명분이생기는것도일이다그런데그대상이일이라해도난혼자결정하지못하는것같다관계가있고기대가있고내가어떤사람으로보여왔는지보이게될지에대한암묵적인합의같은게있다그안에서나는적당히협조적이고",
  "우리는모두에게같은눈이내리기를바라지않는다어떤날에는유독한사람에게만더많은눈이내리기를바란다그눈이그의불빛을가리고이름을덮고흔적마저지워주기를그것은결국누군가를향한기도가아니라나자신의결핍이만들어낸풍경이었다누군가에게는계절을붙잡으려는노래일수도있고누군가에게는끝내놓지못한마음에대한노래일수도있다또누군가에게는아무말없이내리는눈처럼그저지나가는하나의풍경일수도있다눈은누구에게나같은모습으로내리지만그아래에무엇을감추고싶은지는사람마다다르다",
];

const scoreNotes = [
  { name: "jaewook", label: "재욱", src: "/assets/profile/jaewook/note.png" },
  { name: "hyeongu", label: "형우", src: "/assets/profile/hyeongu/note.png" },
  { name: "jin", label: "구진", src: "/assets/profile/jin/note.png" },
  { name: "jeagyun", label: "재균", src: "/assets/profile/jeagyun/note.png" },
  { name: "seoeum", label: "서음", src: "/assets/profile/seoeum/note.png" },
  { name: "hyun", label: "구헌", src: "/assets/profile/hyun/note.png" },
];

export default function MainPage() {
  const openMember = (name) => {
    window.history.pushState({}, "", `/about?member=${name}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  };

  return (
    <main className="home-page">
      <section className="home-page__hero">
        <div className="home-stage">
          <div className="home-page__statement" aria-labelledby="home-title">
            <h1 id="home-title">
              we uncover music from
              <br />
              one another&apos;s writing
            </h1>
          </div>

          <div className="home-score" aria-label="문장으로 만든 오선지">
            <div className="home-score__lines">
              <img
                className="home-score__clef"
                src="/assets/main/treble-clef.png"
                alt=""
                aria-hidden="true"
              />
              {staffLines.map((line, index) => (
                <p className="home-score__line" key={index}>
                  <span>{line.repeat(3)}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="home-score__notes" aria-label="몽글듬 멤버">
            {scoreNotes.map((note, index) => (
              <button
                className={`home-score__note home-score__note--${index + 1}`}
                type="button"
                onClick={() => openMember(note.name)}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label={`${note.label} 소개 보기`}
                key={note.name}
              >
                {note.name === "hyun" && (
                  <img
                    className="home-score__hole"
                    src="/assets/main/dirt-hole.png"
                    alt=""
                    draggable="false"
                  />
                )}
                <img
                  className="home-score__person"
                  src={note.src}
                  alt=""
                  draggable="false"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <PoolSection />
      <HomeContentSections />

    </main>
  );
}
