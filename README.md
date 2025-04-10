# Google Calendar MCP Test

Google Calendar integration with MCP (Model Code Protocol) test

## Setup

1. Create a Google Cloud Project
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Download the credentials and save as `gcp-oauth.keys.json`
5. Install dependencies: `npm install`
6. Run the authentication: `npm run auth`
7. Start the server: `npm start`

## Security and Privacy Notes

### Excluded Files and Directories
보안과 개인정보 보호를 위해 다음 파일들은 GitHub에 업로드하지 않습니다:

1. `gcp-oauth.keys.json`
   - Google Cloud Platform OAuth 인증 키 정보
   - 클라이언트 ID와 시크릿 키 포함
   - 대신 `gcp-oauth.keys.example.json` 파일을 참고하여 직접 생성해야 함

2. `.gcp-saved-tokens.json`
   - Google API 접근을 위한 인증 토큰
   - 사용자의 Google Calendar 접근 권한 포함
   - 로컬에서 자동 생성되는 파일

3. `*.log` 파일들
   - 애플리케이션 로그 파일
   - 디버그 정보와 사용자 활동 기록 포함

4. `node_modules/`
   - npm 패키지 의존성 디렉토리
   - `package.json`과 `package-lock.json`을 통해 재생성 가능

5. `build/`
   - TypeScript 컴파일된 JavaScript 파일들
   - 소스 코드로부터 재생성 가능

### 보안 주의사항

- 절대로 `gcp-oauth.keys.json` 또는 `.gcp-saved-tokens.json`을 공개 저장소에 커밋하지 마세요
- OAuth 인증 정보는 안전하게 보관하세요
- 민감한 데이터는 환경 변수를 사용하세요
- 실제 운영 환경에서는 추가적인 보안 조치를 적용하세요

## Development

이 프로젝트는 TypeScript로 작성되었으며, 다음 명령어로 개발할 수 있습니다:

```bash
# 개발 환경 설정
npm install

# TypeScript 컴파일
npm run build

# 서버 실행
npm start
```