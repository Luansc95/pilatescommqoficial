import { useEffect } from "react";
import { useParams } from "react-router-dom";
import PdfTab from "@/components/app/studentTabs/PdfTab";

export default function StudentPrint() {
  const { id } = useParams();

  useEffect(() => {
    // Trigger print after render
    const t = setTimeout(() => window.print(), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 print:p-0">
      <div className="max-w-4xl mx-auto">
        {id && <PdfTab studentId={id} />}
      </div>
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:p-0 { padding: 0 !important; }
          button, nav, aside, header { display: none !important; }
        }
      `}</style>
    </div>
  );
}
