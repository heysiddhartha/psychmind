import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  "In the last month, how often have you been upset because of something that happened unexpectedly?",
  "In the last month, how often have you felt that you were unable to control the important things in your life?",
  "In the last month, how often have you felt nervous and 'stressed'?",
  "In the last month, how often have you felt confident about your ability to handle your personal problems?",
  "In the last month, how often have you felt that things were going your way?",
  "In the last month, how often have you found that you could not cope with all the things that you had to do?",
  "In the last month, how often have you been able to control irritations in your life?",
  "In the last month, how often have you felt that you were on top of things?",
  "In the last month, how often have you been angered because of things that were outside of your control?",
  "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"
];

// Questions 4, 5, 7, and 8 are positively stated items (reverse scoring: 0=4, 1=3, 2=2, 3=1, 4=0)
const reverseScoredIndices = [3, 4, 6, 7];

const options = [
  { label: "Never", value: 0 },
  { label: "Almost Never", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Fairly Often", value: 3 },
  { label: "Very Often", value: 4 },
];

export default function PSSQuestionnaire() {
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
      // Calculate score with reverse scoring
      const totalScore = newAnswers.reduce((sum, val, index) => {
        if (reverseScoredIndices.includes(index)) {
          return sum + (4 - val);
        }
        return sum + val;
      }, 0);
      navigate('/assessment-results', { state: { score: totalScore, type: 'PSS', max: 40 } });
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
        <title>Perceived Stress Scale (PSS) | The 3 Tree</title>
        <meta name="description" content="Take the Perceived Stress Scale assessment" />
      </Helmet>
      <Layout>
        <section className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="text-white lg:sticky lg:top-24">
                  <h1 className="font-serif text-4xl lg:text-5xl mb-6">
                    PSS
                    <br />
                    QUESTIONNAIRE
                  </h1>
                  <div className="border-t-2 border-white/30 pt-6">
                    <p className="text-gray-200 leading-relaxed">
                      <span className="font-semibold">Instructions:</span> The questions in this scale ask you about your feelings and thoughts during the last month. In each case, you will be asked to indicate by selecting how often you felt or thought a certain way.
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
