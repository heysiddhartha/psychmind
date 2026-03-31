import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  "Little interest or pleasure in doing things.",
  "Feeling down, depressed, or hopeless.",
  "Trouble falling or staying asleep, or sleeping too much.",
  "Feeling tired or having little energy.",
  "Poor appetite or overeating.",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down.",
  "Trouble concentrating on things, such as reading the newspaper or watching television.",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.",
  "Thoughts that you would be better off dead, or of hurting yourself.",
];

const options = [
  { label: "Not At All", value: 0 },
  { label: "Several Days", value: 1 },
  { label: "More Than Half The Days", value: 2 },
  { label: "Nearly Every Day", value: 3 },
];

export default function PHQ9Questionnaire() {
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
      // Calculate score and show results
      const totalScore = newAnswers.reduce((sum, val) => sum + val, 0);
      navigate('/assessment-results', { state: { score: totalScore, type: 'PHQ-9', max: 27 } });
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
        <title>PHQ-9 Depression Assessment | The 3 Tree</title>
        <meta name="description" content="Take the PHQ-9 depression screening questionnaire" />
      </Helmet>
      <Layout>
        <section className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Side - Title and Instructions */}
                <div className="text-white lg:sticky lg:top-24">
                  <h1 className="font-serif text-4xl lg:text-5xl mb-6">
                    PHQ-9
                    <br />
                    QUESTIONNAIRE
                  </h1>
                  <div className="border-t-2 border-white/30 pt-6">
                    <p className="text-gray-200 leading-relaxed">
                      <span className="font-semibold">Instructions:</span> Over the past 2 weeks, 
                      how often have you been bothered by any of the following problems? Please 
                      select the option that best describes your experience.
                    </p>
                  </div>
                </div>

                {/* Right Side - Question Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  {/* Progress Bar */}
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

                  {/* Question */}
                  <h3 className="text-xl font-semibold text-[#2D2D2D] mb-6">
                    {questions[currentQuestion]}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3 mb-8">
                    {options.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                          className="w-5 h-5 text-[#1E293B] focus:ring-[#1E293B]"
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
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

          {/* Disclaimer */}
          <div className="container mx-auto px-4 lg:px-8 mt-12">
            <p className="text-center text-sm text-gray-300 italic max-w-4xl mx-auto">
              This tool is for self-assessment only and is not a diagnosis. Only a qualified 
              clinician can provide a diagnosis. If you are in crisis, please contact emergency 
              services or a local mental-health helpline.
            </p>
          </div>
        </section>
      </Layout>
    </>
  );
}
