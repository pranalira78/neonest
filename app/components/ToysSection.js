"use client";
import React, { useState, useEffect } from "react";
import { Star, Heart, MessageCircle, Baby, Gift, Eye, Ear, Hand, Target, Brain, Shapes, Dumbbell, Scale, Palette, Box, Smile, Zap, Gamepad, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/Button";
import toysData from "../data/toys.json";
import Link from "next/link";
import Image from "next/image";

const ToysSection = ({ babyAgeMonths = "" }) => {
  const [selectedCategory, setSelectedCategory] = useState("0-3m");
  const [toyRatings, setToyRatings] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [favorites, setFavorites] = useState({});

  const categories = [
    { id: "0-3m", label: "0-3 Month", color: "bg-pink-100 text-pink-700" },
    { id: "3-6m", label: "3-6 Month", color: "bg-blue-100 text-blue-700" },
    { id: "6-12m", label: "6-12 Month", color: "bg-green-100 text-green-700" },
    { id: "12-18m", label: "12-18 Month", color: "bg-purple-100 text-purple-700" },
    { id: "18-24m+", label: "18-24 Month+", color: "bg-orange-100 text-orange-700" },
  ];

  const categoryTips = {
    "0-3m": "At 0-3 months, babies are developing sensory awareness. Toys that make gentle sounds and have different textures help stimulate their senses.",
    "3-6m": "At 3-6 months, babies start reaching and grasping. Interactive toys encourage motor development and exploration.",
    "6-12m": "At 6-12 months, babies are sitting and crawling. Toys that promote stacking and problem-solving support cognitive growth.",
    "12-18m": "At 12-18 months, toddlers are walking and talking. Educational toys help with shape recognition and fine motor skills.",
    "18-24m+": "At 18-24 months+, children engage in imaginative play. Building and creative toys foster creativity and spatial awareness.",
  };

  const allSkills = ["Sensory Development", "Auditory Skills", "Motor Skills", "Visual Tracking", "Fine Motor Skills", "Problem Solving", "Shape Recognition", "Gross Motor Skills", "Balance", "Creativity", "Spatial Awareness", "Self-Recognition", "Tracking", "Cognitive Skills", "Imaginative Play", "Cause and Effect", "Exploration", "Emotional Development"];

  const skillIcons = {
    "Sensory Development": Eye,
    "Auditory Skills": Ear,
    "Motor Skills": Hand,
    "Visual Tracking": Target,
    "Fine Motor Skills": Hand,
    "Problem Solving": Brain,
    "Cognitive Skills": Brain,
    "Shape Recognition": Shapes,
    "Gross Motor Skills": Dumbbell,
    "Balance": Scale,
    "Creativity": Palette,
    "Spatial Awareness": Box,
    "Self-Recognition": Smile,
    "Tracking": Target,
    "Imaginative Play": Gamepad,
    "Cause and Effect": Zap,
    "Exploration": Search,
    "Emotional Development": Heart,
  };

  // Determine category based on babyAgeMonths prop if provided
  useEffect(() => {
    if (babyAgeMonths === "") return;
    const age = parseInt(babyAgeMonths, 10);
    if (age >= 0 && age < 3) setSelectedCategory("0-3m");
    else if (age >= 3 && age < 6) setSelectedCategory("3-6m");
    else if (age >= 6 && age < 12) setSelectedCategory("6-12m");
    else if (age >= 12 && age < 18) setSelectedCategory("12-18m");
    else if (age >= 18) setSelectedCategory("18-24m+");
  }, [babyAgeMonths]);

  // Filter toys by selected category, search query, and skills
  const filteredToys = toysData.filter((toy) => {
    const toyAge = parseInt(toy.age.replace('m', ''), 10);
    let ageMatch = false;
    switch (selectedCategory) {
      case "0-3m":
        ageMatch = toyAge >= 0 && toyAge < 3;
        break;
      case "3-6m":
        ageMatch = toyAge >= 3 && toyAge < 6;
        break;
      case "6-12m":
        ageMatch = toyAge >= 6 && toyAge < 12;
        break;
      case "12-18m":
        ageMatch = toyAge >= 12 && toyAge < 18;
        break;
      case "18-24m+":
        ageMatch = toyAge >= 18;
        break;
      default:
        ageMatch = true;
    }
    if (!ageMatch) return false;
    if (searchQuery && !toy.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedSkills.length > 0 && !selectedSkills.some(skill => toy.skills.includes(skill))) return false;
    return true;
  });


  const handleRating = (toyId, rating) => {
    setToyRatings((prev) => ({
      ...prev,
      [toyId]: { ...prev[toyId], rating },
    }));
  };

  const handleFeedback = (toyId, feedback) => {
    setToyRatings((prev) => ({
      ...prev,
      [toyId]: { ...prev[toyId], feedback },
    }));
  };

  const handleFavorite = (toyId) => {
    setFavorites((prev) => ({
      ...prev,
      [toyId]: !prev[toyId],
    }));
  };

  const getAverageRating = (toyId) => {
    const ratings = toyRatings[toyId]?.rating || 0;
    return ratings;
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-6 h-6 text-yellow-600" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Developmental Toys
            </h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Age-appropriate toys that support your baby&apos;s growth and learning through play. Each toy is carefully selected for safety and developmental benefits.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search toys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? `${category.color} shadow-lg transform scale-105`
                  : "bg-white/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Educational Tip */}
        <p className="text-center text-gray-600 dark:text-gray-300 mt-4 max-w-4xl mx-auto mb-8">{categoryTips[selectedCategory]}</p>

        {/* Additional Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</label>
            <select multiple value={selectedSkills} onChange={(e) => setSelectedSkills(Array.from(e.target.selectedOptions, option => option.value))} className="border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-600">
              {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
            </select>
          </div>
        </div>

        {/* Toys Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredToys.slice(0, 6).map((toy) => (
            <Card
              key={toy.id}
              className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-xl">
                  <Image
                    src={toy.image}
                    alt={toy.name}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "/toys/default-toy.jpg";
                    }}
                    unoptimized
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-700/90 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {toy.age}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < getAverageRating(toy.id)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-white font-medium ml-1">
                      {getAverageRating(toy.id) > 0 ? getAverageRating(toy.id) : ""}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {toy.name}
                </CardTitle>

                <p className="text-sm text-gray-500 dark:text-gray-400">Brand: {toy.brand}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Usage Tips: {toy.usageTips}</p>
                {toy.milestones && <p className="text-sm text-gray-600 dark:text-gray-400">Milestones: {toy.milestones.join(", ")}</p>}

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {toy.skills.slice(0, 2).map((skill, index) => {
                      const Icon = skillIcons[skill] || Box;
                      return (
                        <span
                          key={index}
                          title={skill}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center justify-center"
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <strong>Safety:</strong> {toy.safetyNotes}
                </div>

                {toy.purchaseLink && toy.purchaseLink !== "#" && <a href={toy.purchaseLink} className="text-blue-500 text-sm">Purchase</a>}

                {/* Rating & Feedback Section */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rate this toy:
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(toy.id, star)}
                          className="text-yellow-400 hover:text-yellow-500 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= (toyRatings[toy.id]?.rating || 0) ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setShowFeedback((prev) => ({ ...prev, [toy.id]: !prev[toy.id] }))
                      }
                      className="flex-1 text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Feedback
                    </Button>
                    <Button
                      size="sm"
                      className={`flex-1 text-xs ${favorites[toy.id] ? 'bg-red-500 hover:bg-red-600' : 'bg-pink-500 hover:bg-pink-600'}`}
                      onClick={() => handleFavorite(toy.id)}
                    >
                      <Heart className={`w-3 h-3 mr-1 ${favorites[toy.id] ? 'fill-current' : ''}`} />
                      {favorites[toy.id] ? 'Favorited' : 'Favorite'}
                    </Button>
                  </div>

                  {showFeedback[toy.id] && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <textarea
                        placeholder="Share how this toy helped your baby&apos;s..."
                        className="w-full text-sm p-2 border rounded resize-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                        rows="6"
                        maxLength={1000}
                        value={toyRatings[toy.id]?.feedback || ''}
                        onChange={(e) => handleFeedback(toy.id, e.target.value)}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={() => setShowFeedback((prev) => ({ ...prev, [toy.id]: false }))}
                          className="text-xs"
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  )}

                  {toyRatings[toy.id]?.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Feedback:</strong> {toyRatings[toy.id].feedback}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/Toys">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              <Baby className="w-5 h-5 mr-2" />
              Explore All Toys
            </Button>
          </Link>
        </div>

        {/* Safety Notice */}
        <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Safety First</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Always supervise playtime and regularly inspect toys for wear. Clean toys according to manufacturer&apos;s guidelines.
                Choose toys appropriate for your baby&apos;s developmental stage and avoid small parts that could be choking hazards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToysSection;
