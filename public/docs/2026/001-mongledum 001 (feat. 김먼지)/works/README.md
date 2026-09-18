# works

앨범에 연결되는 작업물을 보관합니다. 목록은 `works.json`에서 관리합니다.

- 만화: `cartoon/{작업물}/pages/`에 `001.png`부터 연속된 페이지 이미지 저장
- 이미지: `images/images/`에 `001.png`부터 사진 저장
- 만화를 제외한 대표 이미지: `essay`, `music`, `tumblbug`, `object`, `video`, `images` 폴더 바로 아래의 `cover.png`
- 텀블벅: `works.json`의 `url` 입력
- 영상: `001-물방울이 두근두근/music.txt`의 `youtube` 입력

`works.json`의 `directory`는 `works` 아래 실제 폴더 경로입니다.

상세 URL 규칙: `/serises/{연도}/{앨범}/works/{종류}/{폴더명}`
