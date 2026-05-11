'use client';

interface UserAvatarProps {
  name: string;
  size?: string; // เช่น 'w-8 h-8'
}

export default function UserAvatar({ name, size = 'w-8 h-8' }: UserAvatarProps) {
  // 1. ดึงตัวอักษรแรก (เช่น "Ozone" -> "O")
  const initial = name?.charAt(0).toUpperCase() || '?';

  // 2. ฟังก์ชันสุ่มสีพื้นหลังตามตัวอักษร (เพื่อให้คนเดิมได้สีเดิมเสมอ)
  const getBgColor = (char: string) => {
    const colors: Record<string, string> = {
      A: 'bg-red-500', B: 'bg-blue-500', C: 'bg-green-500', D: 'bg-yellow-600',
      O: 'bg-purple-600', Z: 'bg-pink-500', // เพิ่มสีตามต้องการ
    };
    return colors[char] || 'bg-indigo-500'; // สี Default
  };

  return (
    <div className={`${size} ${getBgColor(initial)} rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden`}>
      <span className={size.includes('w-8') ? 'text-xs' : 'text-sm'}>
        {initial}
      </span>
    </div>
  );
}