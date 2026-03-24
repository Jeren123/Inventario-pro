import { Icons } from "./Icons";

export function Alert({ msg, type = "ok" }) {
  if (!msg) return null;
  return (
    <div className={`inv-alert inv-alert-${type}`}>
      {type === "ok" ? <Icons.Check /> : <Icons.Warn />}
      {msg}
    </div>
  );
}
