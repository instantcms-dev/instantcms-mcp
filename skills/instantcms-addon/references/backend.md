# Backend invariants

- Put backend actions in `backend/actions/`.
- Implement grids as `grid_*` functions in `backend/grids/`; they are not `cmsGrid` classes.
- Put forms in `backend/forms/` and keep action-to-form names consistent.
- Put backend content templates under the active frontend theme controller's `backend/` directory. `admincoreui` supplies the layout shell.
- Confirm destructive actions, permissions, CSRF behavior, and identifier casting before release.
