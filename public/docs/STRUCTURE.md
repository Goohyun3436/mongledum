폴더 구조 `public/docs`

```txt
public/docs/
├── 2026/
    ├── 001-욕망/
    │   ├── album.txt
    │   ├── cover.png
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

앨범 정보 `album.txt` & 커버 이미지 `cover.png`

```txt
release_date: 2026-08-29
---
각자가 숨기고 있던 마음을 음악과 글로 기록한 앨범입니다.

서로 다른 목소리가 하나의 주제를 바라봅니다.
```

<br />

곡 정보 `music.txt`

```txt
title: 음악 페이지에 표시할 곡 제목
composition: 구현, 박재욱, 전형우
lyrics: 구현, 박재욱
date: 2026-08-29
youtube: https://youtu.be/example
---
곡에 대한 설명입니다.
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
