// Core/Application/Services/CourseService.cs - OPTIMIZED VERSION
using EduManagement.Core.Application.DTOs.Course;
using EduManagement.Core.Application.DTOs.CourseClass;
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Application.Interfaces.Services;
using EduManagement.Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EduManagement.Core.Application.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ILogger<CourseService> _logger;

        public CourseService(
            ICourseRepository courseRepository,
            ILogger<CourseService> logger)
        {
            _courseRepository = courseRepository;
            _logger = logger;
        }

        public async Task<CourseListResponseDto> GetAllCoursesAsync(
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
            try
            {
                var (courses, totalRecords) = await _courseRepository.GetAllAsync(
                    semesterId, subjectId, departmentId, facultyId, status, academicYearId, searchTerm, pageNumber, pageSize);

                var courseDtos = new List<CourseResponseDto>();

                // OPTIMIZATION: Calculate statistics from already-loaded data instead of making N+1 queries
                foreach (var course in courses)
                {
                    // Calculate statistics from loaded course classes (no additional query)
                    var activeCourseClasses = course.CourseClasses?
                        .Where(c => !c.IsDeleted && c.IsActive)
                        .ToList() ?? new List<CourseClass>();
                    
                    var totalClasses = activeCourseClasses.Count;
                    var totalStudents = activeCourseClasses
                        .Sum(cc => cc.StudentEnrollments?
                            .Count(se => se.EnrollmentStatus == "registered" && !se.IsDeleted) ?? 0);

                    var courseClassDtos = new List<DTOs.Course.CourseClassDto>();
                    foreach (var cc in activeCourseClasses)
                    {
                        var dayNames = new[] { "", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật" };
                        var dayName = cc.DayOfWeek >= 1 && cc.DayOfWeek <= 7 ? dayNames[cc.DayOfWeek] : "";
                        var room = !string.IsNullOrEmpty(cc.Room?.RoomCode) && !string.IsNullOrEmpty(cc.Room?.RoomName)
                            ? $"{cc.Room.RoomCode} - {cc.Room.RoomName}"
                            : cc.Room?.RoomCode ?? cc.Room?.RoomName ?? "Chưa xếp phòng";
                        
                        // OPTIMIZATION: Calculate enrollment count from loaded enrollments (no additional query)
                        var enrollmentCount = cc.StudentEnrollments?
                            .Count(se => se.EnrollmentStatus == "registered" && !se.IsDeleted) ?? 0;

                        courseClassDtos.Add(new DTOs.Course.CourseClassDto
                        {
                            CourseClassId = cc.CourseClassId,
                            CourseClassCode = cc.CourseClassCode ?? $"LHP{cc.CourseClassId.ToString().Substring(0, 8)}",
                            InstructorName = cc.Instructor?.Person?.FullName ?? "Chưa phân công",
                            EnrolledStudents = enrollmentCount,
                            MaximumStudents = cc.MaxStudents,
                            Room = room,
                            StartDate = cc.DateStart,
                            EndDate = cc.DateEnd,
                            DayOfWeek = cc.DayOfWeek,
                            StartPeriod = cc.StartPeriod,
                            EndPeriod = cc.EndPeriod,
                            CourseClassStatus = cc.CourseClassStatus
                        });
                    }

                    // Extract academic year from semester name or use fallback
                    var courseAcademicYear = "";
                    if (!string.IsNullOrEmpty(course.Semester?.SemesterName))
                    {
                        var semesterName = course.Semester.SemesterName;
                        var yearMatch = System.Text.RegularExpressions.Regex.Match(semesterName, @"(\d{4}-\d{4}|\d{4})");
                        courseAcademicYear = yearMatch.Success ? yearMatch.Value : "";
                    }

                    courseDtos.Add(new CourseResponseDto
                    {
                        CourseId = course.CourseId,
                        SubjectId = course.SubjectId,
                        SubjectName = course.Subject?.SubjectName ?? "",
                        SubjectCode = course.Subject?.SubjectCode ?? "",
                        Credits = course.Subject?.Credits ?? 0,
                        SemesterId = course.SemesterId,
                        SemesterName = course.Semester?.SemesterName ?? "",
                        CourseName = course.Subject?.SubjectName ?? "",
                        CourseCode = course.Subject?.SubjectCode ?? "",
                        AcademicYear = courseAcademicYear,
                        FeePerCredit = course.FeePerCredit,
                        TotalFee = (course.Subject?.Credits ?? 0) * course.FeePerCredit,
                        CourseStatus = course.CourseStatus,
                        TotalClasses = totalClasses,
                        TotalStudents = totalStudents,
                        CreatedAt = course.CreatedAt,
                        UpdatedAt = course.UpdatedAt,
                        CourseClasses = courseClassDtos
                    });
                }

                return new CourseListResponseDto
                {
                    Courses = courseDtos,
                    TotalRecords = totalRecords,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách khóa học");
                throw;
            }
        }

        // ... rest of the methods remain the same ...
    }
}

