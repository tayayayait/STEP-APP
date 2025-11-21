import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'kakao';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-3 text-xl font-bold rounded-2xl transition-all active:scale-[0.98] min-h-[64px] px-6 py-4 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-rehab-blue text-white hover:bg-rehab-blue-dark shadow-blue-200",
    secondary: "bg-white border-2 border-rehab-orange text-rehab-orange hover:bg-orange-50",
    success: "bg-rehab-green text-white hover:bg-green-700 shadow-green-200",
    outline: "border-2 border-rehab-blue text-rehab-blue bg-white hover:bg-blue-50",
    kakao: "bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] border border-yellow-400", // KakaoTalk specific yellow
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};