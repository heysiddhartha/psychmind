import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle, AlertCircle, RefreshCw, Phone } from "lucide-react";

export default function AssessmentResults() {
  const location = useLocation();
  const state = location.state as { score: number; type: string; max: number } | null;

  if (!state) {
    return <Navigate to="/assessments" />;
  }

  const { score, type, max } = state;

  const getSeverity = (score: number, type: string) => {
    if (type === "PHQ-9") {
      if (score <= 4) return { level: "Minimal Depression", color: "text-green-600" };
      if (score <= 9) return { level: "Mild Depression", color: "text-yellow-600" };
      if (score <= 14) return { level: "Moderate Depression", color: "text-orange-600" };
      if (score <= 19) return { level: "Moderately Severe Depression", color: "text-orange-700" };
      return { level: "Severe Depression", color: "text-red-700" };
    }
    if (type === "GAD-7") {
      if (score <= 4) return { level: "Minimal Anxiety", color: "text-green-600" };
      if (score <= 9) return { level: "Mild Anxiety", color: "text-yellow-600" };
      if (score <= 14) return { level: "Moderate Anxiety", color: "text-orange-600" };
      return { level: "Severe Anxiety", color: "text-red-700" };
    }
    if (type === "PSS") {
      if (score <= 13) return { level: "Low Stress", color: "text-green-600" };
      if (score <= 26) return { level: "Moderate Stress", color: "text-yellow-600" };
      return { level: "High Perceived Stress", color: "text-red-700" };
    }
    // Default fallback
    return { level: "Assessment Complete", color: "text-blue-600" };
  };

  const severity = getSeverity(score, type);
  const percentage = Math.round((score / max) * 100);

  return (
    <>
      <Helmet>
        <title>Assessment Results | psychmind</title>
      </Helmet>
      <Layout>
        <section className="min-h-screen bg-[#F5F1ED] py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-[#1E293B] text-white p-8 text-center">
                <h1 className="font-serif text-3xl mb-2">{type} Results</h1>
                <p className="opacity-90">Here is the outcome of your self-assessment.</p>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="w-40 h-40 rounded-full border-8 border-[#F5F1ED] flex items-center justify-center mb-6 relative">
                    <svg className="w-full h-full absolute transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * percentage) / 100}
                        className={severity.color.replace('text', 'text')}
                      />
                    </svg>
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-[#2D2D2D]">{score}</span>
                      <span className="text-gray-500 text-sm">out of {max}</span>
                    </div>
                  </div>
                  
                  <h2 className={`text-2xl font-bold mb-3 ${severity.color}`}>
                    {severity.level}
                  </h2>
                  <p className="text-gray-600 max-w-lg">
                    This score suggests {severity.level.toLowerCase()}. Please remember this is not a clinical diagnosis.
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">What does this mean?</h3>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        If your score indicates moderate to severe symptoms, or if you are feeling distressed regardless of the score, we recommend speaking with a mental health professional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/contact">
                    <Button className="w-full bg-[#1E293B] hover:bg-[#2D3E5F] h-12 text-lg">
                      <Phone className="w-4 h-4 mr-2" /> Book a Consultation
                    </Button>
                  </Link>
                  <Link to="/assessments">
                    <Button variant="outline" className="w-full h-12 text-lg border-2">
                       <RefreshCw className="w-4 h-4 mr-2" /> Take Another Test
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
             <div className="max-w-3xl mx-auto mt-8 text-center">
               <p className="text-sm text-gray-500 italic">
                 Your privacy is important to us. These results are not stored on our servers.
               </p>
             </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
