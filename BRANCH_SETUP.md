# Đưa tài liệu TV7/TV8 lên GitHub

Repo: https://github.com/CNPM-2026-1/he-thong-van-chuyen-hoa-toc

Branch đích: `develop`  
Branch đang review: `systemdesign_api` (đã có trên `origin`)

## 1. Cập nhật branch đang review

Mở PowerShell/Terminal tại thư mục bạn muốn lưu source code. Nếu chưa clone repo:

```powershell
git clone https://github.com/CNPM-2026-1/he-thong-van-chuyen-hoa-toc.git
cd he-thong-van-chuyen-hoa-toc
```

Nếu đã có repo trên máy thì chỉ cần `cd` vào đúng thư mục. Sau đó chạy:

```powershell
git fetch origin
git switch systemdesign_api
git pull --ff-only origin systemdesign_api
git branch --show-current
```

Dòng cuối phải hiển thị `systemdesign_api`. Nếu branch chưa có ở local nhưng đã có trên remote, dùng `git switch --track origin/systemdesign_api`.

## 2. Giải nén gói tài liệu

Tải `tv7-tv8-sprint1-deliverables.zip`, giải nén **nội dung** của file zip ngay tại thư mục gốc repository. Trước khi ghi đè file đã tồn tại, hãy kiểm tra diff để không mất chỉnh sửa mới; `docs/api-contract.md` hiện đã có nội dung. Các thư mục `backend/`, `mobile/`, `web-admin/` không bị thay đổi.

Sau khi giải nén, kiểm tra có các đường dẫn sau:

```text
docs/
  README.md
  architecture.md
  api-contract.md
  openapi.yaml
  realtime-events.md
  diagrams/
  mock-server/
  postman/
```

## 3. Kiểm tra thay đổi và commit

```powershell
git status
git diff --stat
git add README.md DELIVERABLES_README.md BRANCH_SETUP.md docs
git diff --cached --stat
git commit -m "docs: add TV7 TV8 system design and API spec"
```

Review `git diff --cached` trước khi commit để chắc chắn chỉ có các tài liệu thuộc đầu mục TV7/TV8.

## 4. Push branch và mở Pull Request

```powershell
git push -u origin systemdesign_api
```

Vào GitHub, chọn **Compare & pull request** hoặc Pull requests → New pull request:

- **base**: `develop`
- **compare**: `systemdesign_api`
- **title**: `docs: complete TV7/TV8 system design and API specification`
- **reviewers**: nhờ TV1/TV5 và nhóm trưởng review schema, trạng thái, role và phạm vi dữ liệu trước khi merge.

Không merge thẳng vào `develop` trước khi nhóm thống nhất các phần được đánh dấu là đề xuất. Nếu nhóm đổi tên branch, cập nhật lại các lệnh và giá trị **compare** trong tài liệu này.
