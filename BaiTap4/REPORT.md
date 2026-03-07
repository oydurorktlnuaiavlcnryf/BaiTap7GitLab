# Team Report - BaiTap4

## 1) Thành viên và vai trò
- TRẦN BIỆN MINH TÂM (`tranbienminhtam@gmail.com`): maintainer/merge owner, thực hiện merge các MR vào `develop` và `main`, tạo tag release.
- oydurorktlnuaiavlcnryf (`oydurorktlnuaiavlcnryf@ns.do.edu.vn`): developer chính cho các nhánh `feature/*`, `release/1.1.0`, `hotfix/fix-ui`.
- Tran Bien Minh Tam (`tranbienminhtam@example.com`): xử lý conflict khi merge local/remote tại commit `18e6ade`.
- Quan (`thequan1211@gmail.com`): Contributor.
- trongphuoc12 (`trongphuoc098@gmail.com` : Contributor.
- Quang Thiện (`quangthien26120824@gmail.com`): Contributor.
## 2) Danh sách MR
- MR!4 `feature/change-nameA` -> `develop` (merge commit `783291f`): https://gitlab.com/22th_n1_29-30_ccmtptpm/2280614642-tranbienminhtam/-/merge_requests/4
- MR!5 `feature/change-nameB` -> `develop` (merge commit `ba66e85`): https://gitlab.com/22th_n1_29-30_ccmtptpm/2280614642-tranbienminhtam/-/merge_requests/5
- MR!6 `release/1.1.0` -> `main` (merge commit `6fa95be`, tag `v1.1.0`): https://gitlab.com/22th_n1_29-30_ccmtptpm/2280614642-tranbienminhtam/-/merge_requests/6
- MR!7 `hotfix/fix-ui` -> `main` (merge commit `5fbfe47`, tag `v1.1.1`): https://gitlab.com/22th_n1_29-30_ccmtptpm/2280614642-tranbienminhtam/-/merge_requests/7
- MR!8 `revert/fix-ui` -> `develop` (đồng bộ nhánh sau hotfix, merge commit `3e3c719`): https://gitlab.com/22th_n1_29-30_ccmtptpm/2280614642-tranbienminhtam/-/merge_requests/8

## 3) Minh chứng use case
### Use case A - Conflict
- Link MR: Không có MR riêng cho conflict này; conflict phát sinh khi merge local/remote và được resolve trực tiếp trên commit merge.
- Ảnh conflict: Chưa có ảnh conflict được lưu trong repository.
- Commit resolve: `18e6ade3f73ccc2fb0e1b4faeba4e84d31a3b74d` - "Resolve conflict - keep README.md file" (2026-02-03).
- Kết quả test: `node --check app.js`, `node --check web-app/app.js`, `node --check BaiTap3/BaiTap3/app.js` đều pass (exit code 0).

### Use case B - Hotfix
- Link MR: MR!7 `hotfix/fix-ui` -> `main` https://gitlab.com/22th_n1_29-30_ccmtptpm/2280614642-tranbienminhtam/-/merge_requests/7
- Tag: `v1.1.1` tại commit `5fbfe47` (2026-03-06); release trước đó là `v1.1.0` tại commit `6fa95be`.
- Back-merge: MR!8 `revert/fix-ui` -> `develop` (merge commit `3e3c719`, 2026-03-06) để xử lý đồng bộ thay đổi sau hotfix.

## 4) Bài học rút ra
- Nên tách rõ `feature`, `release`, `hotfix` để truy vết thay đổi và rollback nhanh hơn.
- Merge commit cần luôn có MR link để đảm bảo traceability khi audit.
- Sau khi hotfix trên `main`, cần đồng bộ nhánh phát triển ngay để tránh lệch nhánh lâu ngày.
- Cần thống nhất `git config user.name/user.email` để báo cáo contributor chính xác, tránh trùng danh tính.
- Nên lưu thêm ảnh/log conflict trong repo hoặc wiki để hoàn thiện minh chứng use case.
