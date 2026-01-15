import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import logoMQ from "@/assets/logo-mq.png";

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5524998368014&text=Ol%c3%a1%20Myllena,%20gostaria%20de%20saber%20mais%20sobre%20a%20aula%20experimental";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img 
            src={logoMQ} 
            alt="Pilates com MQ" 
            className="h-10 md:h-12 w-auto"
          />
        </a>

        {/* CTA Button */}
        <Button
          asChild
          className="rounded-full px-6 shadow-soft hover:shadow-glow transition-all duration-300"
        >
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Agendar Aula
          </a>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
