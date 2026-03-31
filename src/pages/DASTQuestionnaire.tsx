import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  "Have you used drugs other than those required for medical reasons?",
  "Do you abuse more than one drug at a time?",
  "Are you unable to stop using drugs when you want to?",
  "Have you ever had blackouts or flashbacks as a result of drug use?",
  "Do you ever feel bad or guilty about your drug use?",
  "Does your spouse (or parents) ever complain about your involvement with drugs?",
  "Have you neglected your family because of your use of drugs?",
  "Have you engaged in illegal activities in order to obtain drugs?",
  "Have you ever experienced withdrawal symptoms (felt sick) when you stopped taking drugs?",
  "Have you had medical problems as a result of your drug use (e.g. memory loss, hepatitis, convulsions, bleeding)?"
];

const options = [
  { label: "No", value: 0 },
  { label: "Yes", value: 1 },
];

export default function DASTQuestionnaire() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);

  const handleNext = () => {
    if (selectedAnswer === -1) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(newAnswers[currentQuestion + 1]);
    } else {
      const totalScore = newAnswers.reduce((sum, val) => sum + val, 0);
      navigate('/assessment-results', { state: { score: totalScore, type: 'DAST-10', max: 10 } });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      <Helmet>
        <title>DAST-10 Drug Awareness Assessment | The 3 Tree</title>
        <meta name="description" content="Take the DAST-10 drug use screening questionnaire" />
      </Helmet>
      <Layout>
        <section className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="text-white lg:sticky lg:top-24">
                  <h1 className="font-serif text-4xl lg:text-5xl mb-6">
                    DAST-10
                    <br />
                    QUESTIONNAIRE
                  </h1>
                  <div className="border-t-2 border-white/30 pt-6">
                    <p className="text-gray-200 leading-relaxed">
                      <span className="font-semibold">Instructions:</span> These questions refer to the past 12 months. Please answer each question as carefully and completely as possible.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Question {currentQuestion + 1} of {questions.length}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#1E293B] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-[#2D2D2D] mb-6">
                    {questions[currentQuestion]}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {options.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAnswer === option.value
                            ? "border-[#1E293B] bg-[#1E293B]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option.value}
                          checked={selectedAnswer === option.value}
                          onChange={() => setSelectedAnswer(option.value)}
                          className="hidden"
                        />
                        <span className={`text-xl font-medium ${selectedAnswer === option.value ? 'text-[#1E293B]' : 'text-gray-700'}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {currentQuestion > 0 && (
                      <Button
                        onClick={handlePrevious}
                        variant="outline"
                        className="flex-1"
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      disabled={selectedAnswer === -1}
                      className="flex-1 bg-[#1E293B] hover:bg-[#2D3E5F]"
                    >
                      {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
