import { CourseForm } from './CourseForm';
import { CourseList } from './CourseList';
import type { Course, NewCourse } from '../../../types/course';

interface CourseManagerProps {
  courses: Course[];
  onCreateCourse: (course: NewCourse) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onUpdateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
}

export function CourseManager({
  courses,
  onCreateCourse,
  onDeleteCourse,
  onUpdateCourse
}: CourseManagerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <CourseForm onSubmit={onCreateCourse} />
      <CourseList 
        courses={courses}
        onDeleteCourse={onDeleteCourse}
        onUpdateCourse={onUpdateCourse}
      />
    </div>
  );
}