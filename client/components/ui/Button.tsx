'use client';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}: ButtonProps) => {
  const baseClasses = 'px-4 py-2 rounded font-semibold transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400 disabled:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
    success: 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
