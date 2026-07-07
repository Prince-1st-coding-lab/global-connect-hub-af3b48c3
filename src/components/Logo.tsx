import logo from "@/assets/logo.png";

export const Logo = ({ className = "" }: { className?: string }) => (
  <a href="#home" className={`flex items-center gap-3 ${className}`}>
    <img src={logo} alt="Noble Spaces logo" className="h-12 w-auto md:h-14" />
  </a>
);
