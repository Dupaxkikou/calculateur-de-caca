export default function BigButton({ label, icon, onClick, variant = 'primary', disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`big-btn ${variant === 'primary' ? 'big-btn-primary' : 'big-btn-outline'} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
