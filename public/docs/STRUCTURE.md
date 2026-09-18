폴더 구조 `public/docs`

```txt
public/docs/
├── 2026/
    ├── 001-욕망/
    │   ├── album.txt
    │   ├── cover.png
    │   ├── cover-spine.png
    │   ├── cover-back.png
    │   ├── 001-곡명/
    │   │   ├── music.txt
    │   │   ├── essay.txt
    │   │   └── cover.png
    │   ├── 002-뜨리/
    │   │   ├── music.txt
    │   │   ├── essay.txt
    │   │   └── cover.png
    │   ├── 003-비빕/
    │   │   ├── music.txt
    │   │   └── cover.png
    │   └── objects/
    │       └── 001-파란 부적/
    │           ├── object.txt
    │           ├── cover.png
    │           └── images/
    │               ├── 001.jpg
    │               └── 002.jpg
│   └── 002-앨범명/
        ├── album.txt
        └── cover.png
```

`index.json`은 사용하지 않습니다. 연도, 앨범, 콘텐츠는 폴더명으로 자동 인식합니다.

- 연도: `YYYY`
- 앨범: `{순서}-{앨범명}`
- 콘텐츠: `{순서}-{콘텐츠명}`
- 화면 제목과 정렬 순서는 폴더명을 기준으로 합니다.

<br />

앨범 정보 `album.txt` & 커버 이미지

```txt
release_date: 2026-08-29
title: 앨범 소개글 제목
author: 글쓴이
author_url: https://example.com/author
---
각자가 숨기고 있던 마음을 음악과 글로 기록한 앨범입니다.

서로 다른 목소리가 하나의 주제를 바라봅니다.

[credits]
앨범 프로듀싱 몽글덤
앨범 디자인 홍길동
```

- 앞표지: 앨범 폴더의 `cover.png`, `cover.jpg`, `cover.jpeg`, `cover.webp` 중 하나
- 책등: 앨범 폴더의 `cover-spine.png`, `cover-spine.jpg`, `cover-spine.jpeg`, `cover-spine.webp` 중 하나
- 뒷표지: 앨범 폴더의 `cover-back.png`, `cover-back.jpg`, `cover-back.jpeg`, `cover-back.webp` 중 하나
- 책등 이미지가 없으면 앞표지를 대신 사용

<br />

곡 정보 `music.txt`

```txt
title: 음악 페이지에 표시할 곡 제목
composition: 구현, 박재욱, 전형우
lyrics: 구현, 박재욱
date: 2026-08-29
youtube: https://youtu.be/example
youtube_music: https://music.youtube.com/watch?v=example
instagram: https://www.instagram.com/example
melon: https://www.melon.com/example
apple_music: https://music.apple.com/example
spotify: https://open.spotify.com/example
genie: https://www.genie.co.kr/example
bugs: https://music.bugs.co.kr/example
vibe: https://vibe.naver.com/example
flo: https://www.music-flo.com/example
---
곡에 대한 설명입니다.

[lyrics]
첫 번째 가사 줄
두 번째 가사 줄

다음 연의 첫 번째 줄

[credits]
프로듀싱 몽글덤
레코딩 홍길동
```

<br />

에세이 정보 `essay.txt`

```txt
name: 박재욱
---
에세이 본문입니다.
```

<br />

규칙

- music.txt가 있으면 Music 페이지에 표시
- essay.txt가 있으면 Essay 페이지에 표시
- music.txt의 title이 있으면 Music 페이지에서 폴더명과 다른 곡 제목 사용
- music.txt의 title이 비어 있거나 없으면 콘텐츠 폴더명의 제목 사용
- music.txt의 composition에는 작곡가를 쉼표(`,`)로 구분해 작성
- music.txt의 lyrics에는 작사가를 쉼표(`,`)로 구분해 작성
- music.txt에는 youtube, youtube_music, instagram, melon, apple_music, spotify, genie, bugs, vibe, flo 링크를 각각 작성할 수 있음
- 링크 값이 비어 있으면 Music 페이지의 해당 외부 링크 버튼을 표시하지 않음
- album.txt의 본문 아래 `[credits]`를 적으면 앨범 소개글 하단에 크레딧으로 표시
- album.txt의 author와 author_url은 소개글 본문 하단, 크레딧 위에 표시
- `[lyrics]`를 적으면 이후 텍스트를 가사로 표시하며, 빈 줄로 가사 문단을 구분
- `[credits]`를 적으면 이후 텍스트를 크레딧으로 표시
- music.txt에는 곡 설명, `[lyrics]`, `[credits]` 순서로 작성
- `[credits]`, `[lyrics]`는 필요한 항목만 작성할 수 있음
- 콘텐츠 cover.png가 있으면 곡 커버로 사용
- 콘텐츠 커버가 없으면 앨범의 cover.png 사용
- 새 연도, 앨범, 콘텐츠는 폴더 추가만으로 자동 인식

<br />

사물 정보 `{연도}/{앨범 폴더명}/objects/{순서}-{사물명}/object.txt`

```txt
type: charm
status: 1
link: https://example.com
---
사물에 대한 설명입니다.
```

- 사물 제목과 정렬 순서는 `{순서}-{사물명}` 폴더명에서 자동 인식
- 사물은 연결된 앨범의 `objects` 아래에서 관리
- `year`, `album`, `title`은 경로와 폴더명에서 자동 인식하므로 작성하지 않음
- `status: 1`이면 Objects 페이지에 노출
- `status: 0`이면 자료는 유지하되 Objects 페이지에서 숨김
- `link`가 있을 때만 상세 페이지에 외부 사이트 버튼 표시
- 대표 이미지는 사물 폴더의 `cover.png`, `cover.jpg`, `cover.webp`, `cover.svg` 중 하나 사용
- 실제 사용하는 모습은 `images` 폴더에 여러 장 추가
- 파일명 순서대로 상세 페이지의 일상 사진 갤러리에 표시
- 앨범의 `objects` 아래에 사물 폴더만 추가하면 Objects 목록과 상세 페이지에 자동 반영
