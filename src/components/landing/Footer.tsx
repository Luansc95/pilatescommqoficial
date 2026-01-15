import { Instagram, MessageCircle, Heart } from "lucide-react";

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=5524998368014&text=Ol%c3%a1%20Myllena,%20gostaria%20de%20saber%20mais%20sobre%20a%20aula%20experimental";
const INSTAGRAM_LINK = "https://www.instagram.com/pilatescommq/";

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1 text-2xl font-bold">
            <span className="text-purple-dark">Pilates</span>
            <span className="text-primary">comMQ</span>
          </a>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Feito com <Heart className="w-4 h-4 text-primary fill-primary" /> por PilatescomMQ
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} PilatescomMQ. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
