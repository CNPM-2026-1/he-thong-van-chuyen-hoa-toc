# Đưa tài liệu TV7/TV8 lên GitHub

Repo: https://github.com/CNPM-2026-1/he-thong-van-chuyen-hoa-toc

Branch đích: `develop`  
Branch làm việc: `feature/tv7-tv8-system-design-api`

## 1. Tạo branch mới từ develop

Mở PowerShell/Terminal tại thư mục bạn muốn lưu source code. Nếu chưa clone repo:

```powershell
git clone https://github.com/CNPM-2026-1/he-thong-van-chuyen-hoa-toc.git
cd he-thong-van-chuyen-hoa-toc
```

Nếu đã có repo trên máy thì chỉ cần `cd` vào đúng thư mục. Sau đó chạy:

```powershell
git fetch origin
git switch develop
git pull --ff-only origin develop
git switch -c feature/tv7-tv8-system-design-api
git branch --show-current
```

Dòng cuối phải hiển thị `feature/tv7-tv8-system-design-api`. Lệnh `switch -c` tạo branch local từ `develop`; branch remote sẽ được tạo khi push ở bước 4.

## 2. Giải nén gói tài liệu

Tải `tv7-tv8-sprint1-deliverables.zip`, giải nén **nội dung** của file zip ngay tại thư mục gốc repository. Khi Windows hỏi có ghi đè `docs/api-contract.md` không, chọn ghi đè vì file đó trên repo hiện đang trống. Các thư mục `backend/`, `mobile/`, `web-admin/` không bị thay đổi.

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
git add docs
git diff --cached --stat
git commit -m "docs: add TV7 TV8 system design and API spec"
```

Review `git diff --cached` trước khi commit để chắc chắn chỉ có tài liệu trong `docs/`.

## 4. Push branch và mở Pull Request

```powershell
git push -u origin feature/tv7-tv8-system-design-api
```

Vào GitHub, chọn **Compare & pull request** hoặc Pull requests → New pull request:

- **base**: `develop`
- **compare**: `feature/tv7-tv8-system-design-api`
- **title**: `docs: complete TV7/TV8 system design and API specification`
- **reviewers**: nhờ TV1/TV5 và nhóm trưởng review các schema, trạng thái, role trước khi merge.

Không merge thẳng vào `develop` trước khi nhóm thống nhất các phần được đánh dấu là đề xuất.

## 5. Tạo branch bằng GitHub giao diện (nếu muốn)

Mở repository → branch selector đang hiển thị `develop` → **View all branches** → **New branch**. Nhập `feature/tv7-tv8-system-design-api`, chọn source branch `develop`, rồi Create branch. Sau đó vẫn nên clone/fetch và làm các bước giải nén, commit, push như trên.

## Lưu ý về quyền GitHub

Kết nối GitHub dùng trong phiên làm việc này đọc được repo nhưng thao tác tạo branch bị GitHub từ chối với `403 Resource not accessible by integration`. Vì vậy branch chưa được tạo từ phía công cụ; bạn cần chạy bước 1 hoặc tạo bằng giao diện GitHub. Không có file nào được ghi trực tiếp lên `develop`.
