// Infrastructure/Repositories/CourseRepository.cs
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Domain.Entities;
using EduManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using EduManagement.Core.Application.DTOs.Course;
using EduManagement.Core.Application.DTOs.CourseClass;

namespace EduManagement.Infrastructure.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly EduManagementContext _context;
        private readonly ILogger<CourseRepository> _logger;

        public CourseRepository(EduManagementContext context, ILogger<CourseRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Course?> GetByIdAsync(Guid courseId)
        {
            return await _context.Courses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Where(c => c.CourseId == courseId && !c.IsDeleted && c.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<Course?> GetDetailByIdAsync(Guid courseId)
        {
            return await _context.Courses
                .Include(c => c.Subject)
                    .ThenInclude(s => s.Department)
                .Include(c => c.Semester)
                .Include(c => c.CourseClasses)
                    .ThenInclude(cc => cc.Instructor)
                        .ThenInclude(i => i.Person)
                .Include(c => c.CourseClasses)
                    .ThenInclude(cc => cc.Room)
                .Where(c => c.CourseId == courseId && !c.IsDeleted && c.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<(List<Course> Courses, int TotalRecords)> GetAllAsync(
            Guid? semesterId,
            Guid? subjectId,
            Guid? departmentId,
            Guid? facultyId,
            string? status,
            Guid? academicYearId,
            string? searchTerm,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Courses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                    .ThenInclude(s => s.AcademicYear)
                .Include(c => c.CourseClasses)
                    .ThenInclude(cc => cc.Instructor)
                        .ThenInclude(i => i.Person)
                .Include(c => c.CourseClasses)
                    .ThenInclude(cc => cc.Room)
                        .ThenInclude(r => r.Building)
                .Include(c => c.CourseClasses)
                    .ThenInclude(cc => cc.StudentEnrollments.Where(se => se.EnrollmentStatus == "registered"))
                .Where(c => !c.IsDeleted && c.IsActive);

            if (semesterId.HasValue)
                query = query.Where(c => c.SemesterId == semesterId.Value);

            if (subjectId.HasValue)
                query = query.Where(c => c.SubjectId == subjectId.Value);

            if (departmentId.HasValue)
                query = query.Where(c => c.Subject.DepartmentId == departmentId.Value);

            if (facultyId.HasValue)
            {
                var subjectIdsInFaculty = await _context.Subjects
                    .Where(s => s.Department.FacultyId == facultyId.Value)
                    .Select(s => s.SubjectId)
                    .ToListAsync();
                query = query.Where(c => subjectIdsInFaculty.Contains(c.SubjectId));
            }

            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.CourseStatus == status);

            // Academic year filter (now uses GUID)
            if (academicYearId.HasValue)
                query = query.Where(c => c.Semester.AcademicYearId == academicYearId.Value);

            // Search term filter (searches course name, subject code, subject name, semester name)
            if (!string.IsNullOrEmpty(searchTerm))
                query = query.Where(c => c.Subject.SubjectName.Contains(searchTerm) ||
                                        c.Subject.SubjectCode.Contains(searchTerm) ||
                                        c.Semester.SemesterName.Contains(searchTerm) ||
                                        c.Semester.AcademicYear.YearName.Contains(searchTerm));

            var totalRecords = await query.CountAsync();

            var courses = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (courses, totalRecords);
        }

        public async Task<(List<Course> Courses, int TotalRecords)> GetAllForDropdownAsync(
            Guid? semesterId,
            Guid? subjectId,
            Guid? departmentId,
            Guid? facultyId,
            string? status,
            Guid? academicYearId,
            string? searchTerm,
            int pageNumber,
            int pageSize)
        {
            var query = _context.Courses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                    .ThenInclude(s => s.AcademicYear)
                .Where(c => !c.IsDeleted && c.IsActive);

            if (semesterId.HasValue)
                query = query.Where(c => c.SemesterId == semesterId.Value);

            if (subjectId.HasValue)
                query = query.Where(c => c.SubjectId == subjectId.Value);

            if (departmentId.HasValue)
                query = query.Where(c => c.Subject.DepartmentId == departmentId.Value);

            if (facultyId.HasValue)
            {
                var subjectIdsInFaculty = await _context.Subjects
                    .Where(s => s.Department.FacultyId == facultyId.Value)
                    .Select(s => s.SubjectId)
                    .ToListAsync();
                query = query.Where(c => subjectIdsInFaculty.Contains(c.SubjectId));
            }

            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.CourseStatus == status);

            // Academic year filter (now uses GUID)
            if (academicYearId.HasValue)
                query = query.Where(c => c.Semester.AcademicYearId == academicYearId.Value);

            // Search term filter (searches course name, subject code, subject name, semester name)
            if (!string.IsNullOrEmpty(searchTerm))
                query = query.Where(c => c.Subject.SubjectName.Contains(searchTerm) ||
                                        c.Subject.SubjectCode.Contains(searchTerm) ||
                                        c.Semester.SemesterName.Contains(searchTerm) ||
                                        c.Semester.AcademicYear.YearName.Contains(searchTerm));

            var totalRecords = await query.CountAsync();

            // Apply default sorting by SubjectCode ASC, then CreatedAt DESC
            query = query.OrderBy(c => c.Subject.SubjectCode).ThenByDescending(c => c.CreatedAt);

            // Apply pagination and select only needed fields for performance
            var courses = await query
                .Select(c => new Course
                {
                    CourseId = c.CourseId,
                    Subject = new Subject
                    {
                        SubjectName = c.Subject.SubjectName,
                        SubjectCode = c.Subject.SubjectCode
                    }
                })
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (courses, totalRecords);
        }

        public async Task<Course> CreateAsync(Course course, Guid createdBy)
        {
            course.CourseId = Guid.NewGuid();
            course.CreatedAt = DateTime.UtcNow;
            course.CreatedBy = createdBy;
            course.IsDeleted = false;
            course.IsActive = true;

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Đã tạo khóa học mới: {course.CourseId}");
            return course;
        }

        public async Task<bool> UpdateAsync(Course course, Guid updatedBy)
        {
            var existing = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == course.CourseId && !c.IsDeleted);

            if (existing == null) return false;

            existing.FeePerCredit = course.FeePerCredit;
            existing.CourseStatus = course.CourseStatus;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedBy = updatedBy;

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Đã cập nhật khóa học: {course.CourseId}");
            return true;
        }

        public async Task<bool> SoftDeleteAsync(Guid courseId, Guid deletedBy)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId && !c.IsDeleted);

            if (course == null) return false;

            course.IsDeleted = true;
            course.UpdatedAt = DateTime.UtcNow;
            course.UpdatedBy = deletedBy;

            // Cascade soft delete to course classes
            var courseClasses = await _context.CourseClasses
                .Where(cc => cc.CourseId == courseId && !cc.IsDeleted)
                .ToListAsync();

            foreach (var cc in courseClasses)
            {
                cc.IsDeleted = true;
                cc.UpdatedAt = DateTime.UtcNow;
                cc.UpdatedBy = deletedBy;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Đã xóa mềm khóa học: {courseId}");
            return true;
        }

        public async Task<bool> ChangeStatusAsync(Guid courseId, string newStatus, Guid updatedBy)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.CourseId == courseId && !c.IsDeleted);

            if (course == null) return false;

            course.CourseStatus = newStatus;
            course.UpdatedAt = DateTime.UtcNow;
            course.UpdatedBy = updatedBy;

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Đã thay đổi trạng thái khóa học {courseId} thành {newStatus}");
            return true;
        }

        public async Task<bool> ExistsAsync(Guid subjectId, Guid semesterId)
        {
            return await _context.Courses
                .AnyAsync(c => c.SubjectId == subjectId 
                    && c.SemesterId == semesterId 
                    && !c.IsDeleted 
                    && c.IsActive);
        }

        public async Task<bool> CanDeleteAsync(Guid courseId)
        {
            // Kiểm tra có sinh viên đăng ký không
            var hasActiveEnrollments = await _context.StudentEnrollments
                .AnyAsync(se => se.CourseClass.CourseId == courseId 
                    && se.EnrollmentStatus == "registered"
                    && !se.IsDeleted);

            if (hasActiveEnrollments) return false;

            // Kiểm tra có kỳ thi nào đã publish không
            var hasPublishedExams = await _context.Exams
                .AnyAsync(e => e.CourseId == courseId 
                    && (e.ExamStatus == "published" || e.ExamStatus == "ready")
                    && !e.IsDeleted);

            return !hasPublishedExams;
        }

        public async Task<bool> CanUpdateAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Semester)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && !c.IsDeleted);

            if (course == null) return false;
            if (course.CourseStatus == "completed") return false;
            if (course.Semester.EndDate < DateOnly.FromDateTime(DateTime.UtcNow)) return false;

            return true;
        }

        public async Task<bool> CanChangeStatusAsync(Guid courseId, string newStatus)
        {
            var course = await _context.Courses
                .Include(c => c.Semester)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && !c.IsDeleted);

            if (course == null) return false;

            // Không thể thay đổi từ completed hoặc cancelled
            if (course.CourseStatus == "completed" || course.CourseStatus == "cancelled")
                return false;

            // Kiểm tra các quy tắc chuyển trạng thái
            switch (newStatus)
            {
                case "completed":
                    // Chỉ có thể hoàn thành sau khi học kỳ kết thúc
                    return course.Semester.EndDate < DateOnly.FromDateTime(DateTime.UtcNow);
                
                case "cancelled":
                    // Không thể hủy nếu có sinh viên đăng ký
                    var hasEnrollments = await _context.StudentEnrollments
                        .AnyAsync(se => se.CourseClass.CourseId == courseId 
                            && se.EnrollmentStatus == "registered"
                            && !se.IsDeleted);
                    return !hasEnrollments;
                
                default:
                    return true;
            }
        }

        public async Task<(int TotalClasses, int TotalStudents, int TotalCapacity)> GetCourseStatisticsAsync(Guid courseId)
        {
            var courseClasses = await _context.CourseClasses
                .Where(cc => cc.CourseId == courseId && !cc.IsDeleted)
                .ToListAsync();

            var totalClasses = courseClasses.Count;
            var totalCapacity = courseClasses.Sum(cc => cc.MaxStudents);

            var totalStudents = await _context.StudentEnrollments
                .Where(se => se.CourseClass.CourseId == courseId 
                    && se.EnrollmentStatus == "registered"
                    && !se.IsDeleted)
                .CountAsync();

            return (totalClasses, totalStudents, totalCapacity);
        }

        public async Task<(int Total, int Active, int Completed, int Cancelled, int TotalStudents, decimal TotalRevenue)> GetSummaryStatisticsAsync()
        {
            var courses = await _context.Courses
                .Include(c => c.Subject)
                .Where(c => !c.IsDeleted && c.IsActive)
                .ToListAsync();

            var total = courses.Count;
            var active = courses.Count(c => c.CourseStatus == "active");
            var completed = courses.Count(c => c.CourseStatus == "completed");
            var cancelled = courses.Count(c => c.CourseStatus == "cancelled");

            var totalStudents = await _context.StudentEnrollments
                .Where(se => se.EnrollmentStatus == "registered" && !se.IsDeleted)
                .CountAsync();

            var totalRevenue = courses.Sum(c => c.Subject.Credits * c.FeePerCredit);

            return (total, active, completed, cancelled, totalStudents, totalRevenue);
        }

        public async Task<Subject?> GetSubjectAsync(Guid subjectId)
        {
            return await _context.Subjects
                .Include(s => s.Department)
                .Where(s => s.SubjectId == subjectId && !s.IsDeleted && s.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<Semester?> GetSemesterAsync(Guid semesterId)
        {
            return await _context.Semesters
                .Where(s => s.SemesterId == semesterId && !s.IsDeleted && s.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<List<CourseClass>> GetCourseClassesAsync(Guid courseId)
        {
            return await _context.CourseClasses
                .Include(cc => cc.Instructor)
                    .ThenInclude(i => i.Person)
                .Include(cc => cc.Room)
                .Where(cc => cc.CourseId == courseId && !cc.IsDeleted && cc.IsActive)
                .ToListAsync();
        }

        public async Task<int> GetEnrollmentCountAsync(Guid courseId)
        {
            return await _context.StudentEnrollments
                .Where(se => se.CourseClass.CourseId == courseId 
                    && se.EnrollmentStatus == "registered"
                    && !se.IsDeleted)
                .CountAsync();
        }

        public async Task<int> GetEnrollmentCountByCourseClassIdAsync(Guid courseClassId)
        {
            return await _context.StudentEnrollments
                .Where(se => se.CourseClassId == courseClassId
                    && se.EnrollmentStatus == "registered"
                    && !se.IsDeleted)
                .CountAsync();
        }

        public async Task<List<CourseClassStudentDto>> GetStudentsByCourseClassIdAsync(Guid courseClassId)
        {
            // Use a simpler approach to avoid LINQ translation issues
            var students = await _context.StudentEnrollments
                .Where(se => se.CourseClassId == courseClassId && !se.IsDeleted)
                .Include(se => se.Student)
                    .ThenInclude(s => s.Person)
                .ToListAsync();

            return students.Select(se => new CourseClassStudentDto
            {
                StudentId = se.Student.StudentId,
                StudentCode = se.Student.StudentCode,
                FullName = se.Student.Person.FullName,
                Email = se.Student.Person.Email,
                PhoneNumber = se.Student.Person.PhoneNumber ?? string.Empty,
                EnrollmentStatus = se.EnrollmentStatus ?? "registered",
                EnrollmentDate = se.EnrollmentDate.HasValue ? se.EnrollmentDate.Value.ToDateTime(TimeOnly.MinValue) : se.CreatedAt
            })
            .OrderBy(x => x.StudentCode)
            .ToList();
        }        // Course Class Operations Implementation

        public async Task<CourseClass?> GetCourseClassByIdAsync(Guid courseClassId)
        {
            return await _context.CourseClasses
                .Where(cc => cc.CourseClassId == courseClassId && !cc.IsDeleted && cc.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<CourseClass?> GetCourseClassDetailByIdAsync(Guid courseClassId)
        {
            return await _context.CourseClasses
                .Include(cc => cc.Course)
                    .ThenInclude(c => c.Subject)
                .Include(cc => cc.Course)
                    .ThenInclude(c => c.Semester)
                .Include(cc => cc.Instructor)
                    .ThenInclude(i => i!.Person)
                .Include(cc => cc.Room)
                    .ThenInclude(r => r!.Building)
                .Where(cc => cc.CourseClassId == courseClassId && !cc.IsDeleted && cc.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<CourseClass> CreateCourseClassAsync(CourseClass courseClass, Guid createdBy)
        {
            courseClass.CourseClassId = Guid.NewGuid();
            courseClass.CreatedAt = DateTime.UtcNow;
            courseClass.CreatedBy = createdBy;
            courseClass.IsDeleted = false;
            courseClass.IsActive = true;

            _context.CourseClasses.Add(courseClass);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created course class: {courseClass.CourseClassId} for course: {courseClass.CourseId}");
            return courseClass;
        }

        public async Task<bool> UpdateCourseClassAsync(CourseClass courseClass, Guid updatedBy)
        {
            var existingCourseClass = await _context.CourseClasses
                .FirstOrDefaultAsync(cc => cc.CourseClassId == courseClass.CourseClassId);

            if (existingCourseClass == null)
                return false;

            existingCourseClass.RoomId = courseClass.RoomId;
            existingCourseClass.InstructorId = courseClass.InstructorId;
            existingCourseClass.DateStart = courseClass.DateStart;
            existingCourseClass.DateEnd = courseClass.DateEnd;
            existingCourseClass.DayOfWeek = courseClass.DayOfWeek;
            existingCourseClass.StartPeriod = courseClass.StartPeriod;
            existingCourseClass.EndPeriod = courseClass.EndPeriod;
            existingCourseClass.MaxStudents = courseClass.MaxStudents;
            existingCourseClass.UpdatedAt = DateTime.UtcNow;
            existingCourseClass.UpdatedBy = updatedBy;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated course class: {courseClass.CourseClassId}");
            return true;
        }

        public async Task<bool> DeleteCourseClassAsync(Guid courseClassId, Guid deletedBy)
        {
            var courseClass = await _context.CourseClasses
                .FirstOrDefaultAsync(cc => cc.CourseClassId == courseClassId);

            if (courseClass == null)
                return false;

            courseClass.IsDeleted = true;
            courseClass.IsActive = false;
            courseClass.UpdatedAt = DateTime.UtcNow;
            courseClass.UpdatedBy = deletedBy;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Soft deleted course class: {courseClassId}");
            return true;
        }

        public async Task<string> GenerateCourseClassCodeAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                throw new InvalidOperationException("Khóa học không tồn tại");

            var baseCourseCode = course.Subject?.SubjectCode ?? course.CourseCode;

            // Get all existing course class codes for this course
            var existingCodes = await _context.CourseClasses
                .Where(cc => cc.CourseId == courseId)
                .Select(cc => cc.CourseClassCode)
                .ToListAsync();

            // Find the maximum number used
            int maxNumber = 0;
            foreach (var code in existingCodes)
            {
                // Extract number from code like "SE301_4"
                var parts = code.Split('_');
                if (parts.Length > 1 && int.TryParse(parts[^1], out int number))
                {
                    if (number > maxNumber)
                        maxNumber = number;
                }
            }

            return $"{baseCourseCode}_{maxNumber + 1}";
        }

        // Schedule Conflict Detection Implementation

        public async Task<bool> HasScheduleConflictAsync(Guid roomId, DateOnly startDate, DateOnly endDate, int dayOfWeek, int startPeriod, int endPeriod, Guid? excludeCourseClassId = null)
        {
            var query = _context.CourseClasses
                .Where(cc => cc.RoomId == roomId
                    && cc.IsActive && !cc.IsDeleted
                    && cc.DayOfWeek == dayOfWeek
                    && cc.DateStart <= endDate
                    && cc.DateEnd >= startDate
                    && cc.StartPeriod < endPeriod
                    && cc.EndPeriod > startPeriod);

            if (excludeCourseClassId.HasValue)
            {
                query = query.Where(cc => cc.CourseClassId != excludeCourseClassId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> HasInstructorConflictAsync(Guid instructorId, DateOnly startDate, DateOnly endDate, int dayOfWeek, int startPeriod, int endPeriod, Guid? excludeCourseClassId = null)
        {
            var query = _context.CourseClasses
                .Where(cc => cc.InstructorId == instructorId
                    && cc.IsActive && !cc.IsDeleted
                    && cc.DayOfWeek == dayOfWeek
                    && cc.DateStart <= endDate
                    && cc.DateEnd >= startDate
                    && cc.StartPeriod < endPeriod
                    && cc.EndPeriod > startPeriod);

            if (excludeCourseClassId.HasValue)
            {
                query = query.Where(cc => cc.CourseClassId != excludeCourseClassId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<List<CourseClass>> GetConflictingClassesAsync(Guid roomId, DateOnly startDate, DateOnly endDate, int dayOfWeek, int startPeriod, int endPeriod, Guid? excludeCourseClassId = null)
        {
            var query = _context.CourseClasses
                .Include(cc => cc.Course)
                    .ThenInclude(c => c.Subject)
                .Include(cc => cc.Instructor)
                    .ThenInclude(i => i!.Person)
                .Where(cc => cc.RoomId == roomId
                    && cc.IsActive && !cc.IsDeleted
                    && cc.DayOfWeek == dayOfWeek
                    && cc.DateStart <= endDate
                    && cc.DateEnd >= startDate
                    && cc.StartPeriod < endPeriod
                    && cc.EndPeriod > startPeriod);

            if (excludeCourseClassId.HasValue)
            {
                query = query.Where(cc => cc.CourseClassId != excludeCourseClassId.Value);
            }

            return await query.ToListAsync();
        }

        // Schedule Suggestions Implementation

        public async Task<List<Room>> GetAvailableRoomsAsync(DateOnly date, int dayOfWeek, int startPeriod, int endPeriod, Guid? buildingId = null, string? roomType = null)
        {
            var occupiedRoomIds = await _context.CourseClasses
                .Where(cc => cc.IsActive && !cc.IsDeleted
                    && cc.DayOfWeek == dayOfWeek
                    && cc.DateStart <= date
                    && cc.DateEnd >= date
                    && cc.StartPeriod < endPeriod
                    && cc.EndPeriod > startPeriod)
                .Select(cc => cc.RoomId)
                .ToListAsync();

            var query = _context.Rooms
                .Include(r => r.Building)
                .Where(r => r.IsActive && !r.IsDeleted
                    && !occupiedRoomIds.Contains(r.RoomId));

            if (buildingId.HasValue)
            {
                query = query.Where(r => r.BuildingId == buildingId.Value);
            }

            if (!string.IsNullOrEmpty(roomType))
            {
                query = query.Where(r => r.RoomType == roomType);
            }

            return await query
                .OrderBy(r => r.Building!.BuildingName)
                .ThenBy(r => r.RoomName)
                .ToListAsync();
        }

        public async Task<Room?> GetRoomByIdAsync(Guid roomId)
        {
            return await _context.Rooms
                .Include(r => r.Building)
                .Where(r => r.RoomId == roomId && r.IsActive && !r.IsDeleted)
                .FirstOrDefaultAsync();
        }

        public async Task<Instructor?> GetInstructorByIdAsync(Guid instructorId)
        {
            return await _context.Instructors
                .Include(i => i.Person)
                .Where(i => i.InstructorId == instructorId && i.IsActive && !i.IsDeleted)
                .FirstOrDefaultAsync();
        }

        // Business Logic Support Implementation

        public async Task<(DateOnly endDate, int dayOfWeek)> CalculateEndDateAndDayOfWeekAsync(Guid courseId, DateOnly startDate, string periodRange)
        {
            var course = await _context.Courses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                throw new InvalidOperationException("Course not found");

            var dayOfWeek = (int)startDate.DayOfWeek == 0 ? 8 : (int)startDate.DayOfWeek + 1; // Convert .NET DayOfWeek to DB format: Sunday(0)->8, Monday(1)->2, etc.

            // Calculate total hours required based on credits
            var credits = course.Subject?.Credits ?? 3;
            var totalHoursRequired = credits * 15; // Each credit = 15 hours total in semester

            // Determine periods per week based on period range
            var periodsPerWeek = periodRange.ToLower() switch
            {
                "morning" => 5,    // periods 1-5, more intensive
                "afternoon" => 5,  // periods 6-10, standard
                "evening" => 3,    // periods 11-13, less intensive
                _ => throw new InvalidOperationException($"Invalid period range: {periodRange}")
            };

            // Each period is approximately 0.75 hours (45 minutes)
            var hoursPerWeek = periodsPerWeek * 0.75;
            var weeksRequired = (int)Math.Ceiling(totalHoursRequired / hoursPerWeek);
            
            // Calculate end date
            var endDate = startDate.AddDays((weeksRequired - 1) * 7);

            // Ensure end date doesn't exceed semester end date
            if (course.Semester != null && endDate > course.Semester.EndDate)
            {
                endDate = course.Semester.EndDate;
            }

            return (endDate, dayOfWeek);
        }

        public async Task<(int startPeriod, int endPeriod)> GetTimePeriodsForCourseAsync(Guid courseId, string periodRange)
        {
            var course = await _context.Courses
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                throw new InvalidOperationException("Course not found");

            var credits = course.Subject?.Credits ?? 3;

            // Determine periods needed based on credits (minimum 2 periods per session)
            var periodsNeeded = Math.Max(credits, 2);

            // Map period range to specific start and end periods
            return periodRange.ToLower() switch
            {
                "morning" => (1, Math.Min(1 + periodsNeeded - 1, 5)), // periods 1-5
                "afternoon" => (6, Math.Min(6 + periodsNeeded - 1, 10)), // periods 6-10
                "evening" => (11, Math.Min(11 + periodsNeeded - 1, 12)), // periods 11-12 (DB max is 12)
                _ => throw new InvalidOperationException($"Invalid period range: {periodRange}")
            };
        }

        public async Task<bool> IsDateWithinSemesterAsync(Guid courseId, DateOnly date)
        {
            var course = await _context.Courses
                .Include(c => c.Semester)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course?.Semester == null)
                return false;

            return date >= course.Semester.StartDate && date <= course.Semester.EndDate;
        }
    }
}