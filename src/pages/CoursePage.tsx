import { useState } from 'react';
import { Book, Calendar, User, GitBranch as BrandTelegram, Link, Lock, Search, ExternalLink, MapPin, Users, UserCircle2 } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import type { Course } from '../types/course';

export function CoursePage() {
  const { courses, loading } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {searchTerm ? 'No courses match your search' : 'No courses available'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {searchTerm ? 'Try a different search term' : 'Check back later for updates'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 px-3 sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer relative
                border border-gray-100 dark:border-gray-700 
                transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                dark:hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)]
                active:scale-[0.98] touch-manipulation"
            >
              <div className="flex flex-col sm:flex-row w-full">
                {/* Time Column */}
                <div className="sm:w-32 bg-gray-50 dark:bg-gray-700/50
                  py-2.5 px-4 sm:p-4 flex flex-row sm:flex-col items-center sm:items-center 
                  justify-between sm:justify-center gap-2 sm:gap-4
                  border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700/70"
                >
                  {course.classTimes.map((time, index) => (
                    <div key={index} className="flex flex-col space-y-1">
                      <div className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                        {time.time}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {time.day}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {time.classroom || "KT-515"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Course Details */}
                <div className="flex-1 p-3 sm:p-4">
                  <div className="space-y-3">
                    {/* Course Code and Name */}
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {course.name}
                        </h2>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 
                          bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full ml-2">
                          {course.code}
                        </span>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 
                          px-2 py-1 rounded-lg">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Section
                          </span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {course.section || "63_G"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 min-w-0 mt-2">
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 
                          px-2 py-1 rounded-lg">
                          <UserCircle2 className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Teacher
                          </span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {course.teacher}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCourse(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedCourse.name}
                  </h2>
                  <p className="text-blue-600 dark:text-blue-400 mt-1">
                    {selectedCourse.code}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Section</div>
                    <div className="text-gray-900 dark:text-white mt-1 font-medium">
                      {selectedCourse.section || "63_G"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Teacher</div>
                    <div className="text-gray-900 dark:text-white mt-1 font-medium">
                      {selectedCourse.teacher}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Room</div>
                    <div className="text-gray-900 dark:text-white mt-1 font-medium">
                      {selectedCourse.classTimes[0]?.classroom}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Schedule</h3>
                  <div className="space-y-2">
                    {selectedCourse.classTimes.map((time, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 
                          dark:bg-gray-700/50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {time.day} at {time.time}
                          </span>
                        </div>
                        {time.classroom && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{time.classroom}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(selectedCourse.blcLink || selectedCourse.telegramGroup || selectedCourse.blcEnrollKey) && (
                  <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-6">
                    {selectedCourse.blcEnrollKey && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <Lock className="w-4 h-4" />
                        <span>Enroll Key:</span>
                        <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-900 dark:text-white">
                          {selectedCourse.blcEnrollKey}
                        </code>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      {selectedCourse.blcLink && (
                        <a
                          href={selectedCourse.blcLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Link className="w-4 h-4" />
                          <span>BLC Course</span>
                        </a>
                      )}

                      {selectedCourse.telegramGroup && (
                        <a
                          href={selectedCourse.telegramGroup}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <BrandTelegram className="w-4 h-4" />
                          <span>Telegram Group</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}