import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { useState } from "react";

export default function OurStory() {
  const [activeTab, setActiveTab] = useState<"story" | "vision">("story");

  return (
    <>
      <Helmet>
        <title>Our Story & Vision | psychmind - Mental Wellness</title>
        <meta
          name="description"
          content="Learn about psychmind's journey, our founder Siddhartha Sarkar's story, and our vision for holistic mental wellness."
        />
        <meta
          name="keywords"
          content="about us, our story, mental health mission, therapy vision, holistic wellness"
        />
      </Helmet>
      <Layout>
        <section className="pt-24 pb-16 lg:pb-24 bg-[#F5F1ED]">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Founder Section */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg">
                <h1 className="font-serif text-3xl lg:text-4xl text-[#2D2D2D] mb-2">
                  Siddhartha Sankar Sarkar
                </h1>
                <p className="text-sm text-gray-600 mb-8">
                  Founder · psychmind.com
                </p>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p>
                    Even as a child, I was fascinated by how differently people behave on the outside compared to in their quiet, unguarded moments. That curiosity stayed with me. I wanted to understand the space between what people say out loud and what they feel in silence.
                  </p>

                  <p>
                    Growing up, I struggled to understand my own patterns and reactions, which led me to explore spirituality and the deeper layers of the self. I wanted to understand why, despite everything, I felt the way I did. It was a journey of unlearning as much as learning.
                  </p>

                  <p>
                    Over time, I realized something essential:<br />
                    <strong>We come to know ourselves best through our interactions with other people.</strong>
                  </p>

                  <p>
                    It is in relationships, friendships, family dynamics, love, conflict, connection that our deepest patterns show up. These interactions often highlight our shortcomings, our triggers, our defenses — and yes, they can end up shaping our entire emotional world.
                  </p>

                  <p>
                    But beneath all of that, our soul's language is universal.
                  </p>

                  <div className="pl-6 border-l-4 border-[#8BA888] space-y-3 my-6">
                    <p><strong className="text-[#8BA888]">Connection</strong> — Need to feel seen, understood, and mirrored by another.</p>
                    <p><strong className="text-[#8BA888]">Love</strong> — Need to experience compassion and safety for deeper intimacy.</p>
                    <p><strong className="text-[#8BA888]">Truth</strong> — Need to live aligned, authentic, free from all masks.</p>
                    <p><strong className="text-[#8BA888]">Growth</strong> — Need to embrace challenges, gently pushing toward highest potential.</p>
                    <p><strong className="text-[#8BA888]">Freedom</strong> — Need to release fears, patterns, and limiting conditioning fully.</p>
                    <p><strong className="text-[#8BA888]">Peace</strong> — Need to find stillness when body, mind, and spirit are aligned.</p>
                    <p><strong className="text-[#8BA888]">Meaning</strong> — Need to seek purpose giving struggles context and wisdom.</p>
                    <p><strong className="text-[#8BA888]">Joy</strong> — Need to align with values experiencing life, lasting happiness within.</p>
                    <p><strong className="text-[#8BA888]">Compassion</strong> — Need to understand suffering, responding gently to self and others.</p>
                    <p><strong className="text-[#8BA888]">Presence</strong> — Need to feel fully alive, aware, grounded with what moment.</p>
                  </div>

                  <p>
                    The soul communicates not in words, but through presence, intuition, energy, and the gentle nudges that align with who we are meant to become.
                  </p>

                  <p>
                    And yet, the real challenge is learning <strong>how to navigate these patterns without losing ourselves</strong>... how to grow past the emotional blocks and limiting beliefs that hold us back, without losing our sense of peace, our self-uplifting, our experiences, and the adversities we face. But beneath all those layers, I still believe our soul's language is universal and deeply connected.
                  </p>

                  <p>
                    That understanding is what led me to psychology. It became the bridge between the mind, spirituality, and consciousness, a way to understand why we feel the way we do, how our beliefs shape us, how healing works, and how to integrate the layers that shape us, our genes, our upbringing, our experiences, and the adversities we face. But beneath all those layers, I still believe our soul's language is universal and deeply connected.
                  </p>

                  <p>
                    Choosing psychology wasn't just a career path for me.<br />
                    It was a way to help people understand themselves through their relationships, move beyond the beliefs that limit them, and reconnect with the part of them that knows exactly who they are meant to become.<br />
                    Because our purpose doesn't reveal itself when we are perfect, it reveals itself when we understand ourselves.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Story & Vision Tabs */}
            <div className="max-w-5xl mx-auto">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-300 mb-8">
                <button
                  onClick={() => setActiveTab("story")}
                  className={`flex-1 py-4 text-center font-serif text-lg lg:text-xl transition-colors ${
                    activeTab === "story"
                      ? "bg-[#2D2D2D] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Our Story
                </button>
                <button
                  onClick={() => setActiveTab("vision")}
                  className={`flex-1 py-4 text-center font-serif text-lg lg:text-xl transition-colors ${
                    activeTab === "vision"
                      ? "bg-[#2D2D2D] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Our Vision
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-lg">
                {activeTab === "story" ? (
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <p>
                      Our journey began with a simple realization: <strong className="text-[#2D2D2D]">true well-being comes from nurturing the mind, body, and soul together.</strong> We noticed that many people struggle to feel balanced, connected, and fully alive, often focusing on one part of themselves while neglecting the rest.
                    </p>

                    <p>
                      From observing human behavior to exploring the deeper layers of emotion and consciousness, we discovered that <strong className="text-[#2D2D2D]">healing and growth happen when the mind, body, and soul are aligned.</strong> Every experience, challenge, and relationship shapes us, guiding us toward self-awareness and transformation. As they say, "we are nothing but our choices."
                    </p>

                    <p>
                      This inspired us to create a space where people can <strong className="text-[#2D2D2D]">explore themselves fully, reconnect with their inner essence, and find balance in life.</strong> Our story is about curiosity, compassion, and connection — a journey of understanding, self-discovery, and awakening, guiding individuals toward living more aligned, meaningful, and conscious lives.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <p>
                      We envision a world where every <strong className="text-[#2D2D2D]">individual</strong> can:
                    </p>

                    <ul className="space-y-3 pl-6">
                      <li className="flex items-start gap-3">
                        <span className="text-[#8BA888] mt-1">•</span>
                        <span><strong className="text-[#2D2D2D]">Know themselves deeply</strong> through reflection, presence, and authentic connection.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#8BA888] mt-1">•</span>
                        <span><strong className="text-[#2D2D2D]">Heal deeply,</strong> integrating emotional, physical, and spiritual well-being.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#8BA888] mt-1">•</span>
                        <span><strong className="text-[#2D2D2D]">Align with their soul's language,</strong> living courageously, authentically, and in balance.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#8BA888] mt-1">•</span>
                        <span><strong className="text-[#2D2D2D]">Transform challenges</strong> into teachers of growth, freedom, and wisdom.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#8BA888] mt-1">•</span>
                        <span><strong className="text-[#2D2D2D]">Experience peace, joy, and vitality</strong> in natural expressions of being.</span>
                      </li>
                    </ul>

                    <p className="pt-4">
                      <strong className="text-[#8BA888]">Our mission</strong> is to provide a <strong className="text-[#2D2D2D]">holistic approach,</strong> uniting psychology, spirituality, yoga, nutrition, and wellness practices. We guide people toward <strong className="text-[#2D2D2D]">mind-body-soul harmony,</strong> empowering them to live their fullest, truest essence, so people can nurture every part of themselves, live fully aligned with purpose, meaning, and inner light.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
