import VMCLoader from "./VMCLoader";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function Loading({ size = "md", text = "Loading..." }: LoadingProps) {
  const sizeMap = {
    sm: 32,
    md: 48, 
    lg: 64
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <VMCLoader size={sizeMap[size]} />
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  );
}