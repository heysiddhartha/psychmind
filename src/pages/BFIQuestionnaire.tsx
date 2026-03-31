import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  "I see myself as someone who is reserved",
  "I see myself as someone who is generally trusting",
  "I see myself as someone who tends to be lazy",
  "I see myself as someone who is relaxed, handles stress well",
  "I see myself as someone who has few artistic interests",
  "I see myself as someone who is outgoing, sociable",
  "I see myself as someone who tends to find fault with others",
  "I see myself as someone who does a thorough job",
  "I see myself as someone who gets nervous easily",
  "I see myself as someone who has an active imagination"
];

const options = [
  { label: "Disagree Strongly", value: 1 },
  { label: "Disagree a Little", value: 2 },
  { label: "Neither Agree nor Disagree", value: 3 },
  { label: "Agree a Little", value: 4 },
  { label: "Agree Strongly", value: 5 },
];

export default function BFIQuestionnaire() {
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
      // BFI has no single total score but trait scores.
      // For simplicity in this demo, we'll just sum them up, 
      // but in a real app, you'd calculate Big 5 traits separately.
      const totalScore = newAnswers.reduce((sum, val) => sum + val, 0);
      navigate('/assessment-results', { state: { score: totalScore, type: 'BFI-10', max: 50 } });
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
        <title>BFI-10 Personality Assessment | psychmind</title>
        <meta name="description" content="Take the Big Five Inventory-10 personality assessment" />
      </Helmet>
      <Layout>
        <section className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#2D3E5F] py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="text-white lg:sticky lg:top-24">
                  <h1 className="font-serif text-4xl lg:text-5xl mb-6">
                    BFI-10
                    <br />
                    QUESTIONNAIRE
                  </h1>
                  <div className="border-t-2 border-white/30 pt-6">
                    <p className="text-gray-200 leading-relaxed">
                      <span className="font-semibold">Instructions:</span> Here are a number of characteristics that may or may not apply to you. For example, do you agree that you are someone who likes to spend time with others? Please select the option that best describes your agreement with each statement.
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
