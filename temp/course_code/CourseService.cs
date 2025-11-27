// Core/Application/Services/CourseService.cs
using EduManagement.Core.Application.DTOs.Course;
using EduManagement.Core.Application.DTOs.CourseClass;
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Application.Interfaces.Services;
using EduManagement.Core.Domain.Entities;
using Microsoft.Extensions.Logging;
using InstructorEntity = EduManagement.Core.Domain.Entities.Instructor;

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

                // OPTIMIZED: Calculate statistics from already-loaded data instead of making N+1 queries
                foreach (var course in courses)
                {
                    // Calculate statistics from loaded course classes (no additional query needed)
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
                        
                        // OPTIMIZED: Calculate enrollment count from loaded enrollments (no additional query)
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

                        // Flattened properties for backward compatibility
                        CourseName = course.Subject?.SubjectName ?? "",
                        CourseCode = course.CourseCode ?? course.Subject?.SubjectCode ?? "",
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

        public async Task<CourseDropdownListResponseDto> GetCoursesForDropdownAsync(
            Guid? semesterId,
            Guid? subjectId,
            Guid? departmentId,
            Guid? facultyId,
            string? status,
            Guid? academicYearId,
            string? searchTerm,
            int pageNumber = 1,
            int pageSize = 50)
        {
            try
            {
                var (courses, totalRecords) = await _courseRepository.GetAllForDropdownAsync(
                    semesterId, subjectId, departmentId, facultyId, status, academicYearId, searchTerm, pageNumber, pageSize);

                var courseDtos = courses.Select(course => new CourseDropdownResponseDto
                {
                    CourseId = course.CourseId,
                    DisplayName = $"{course.Subject?.SubjectName} - {course.Subject?.SubjectCode}"
                }).ToList();

                return new CourseDropdownListResponseDto
                {
                    Courses = courseDtos,
                    TotalCount = totalRecords,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
                    HasPreviousPage = pageNumber > 1,
                    HasNextPage = pageNumber < (int)Math.Ceiling(totalRecords / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách khóa học cho dropdown");
                throw;
            }
        }

        public async Task<CourseDetailResponseDto?> GetCourseDetailAsync(Guid courseId)
        {
            try
            {
                var course = await _courseRepository.GetDetailByIdAsync(courseId);
                if (course == null) return null;

                var courseClasses = await _courseRepository.GetCourseClassesAsync(courseId);

                var courseClassDtos = courseClasses.Select(cc =>
                {
                    var dayNames = new[] { "", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật" };
                    var dayName = cc.DayOfWeek >= 1 && cc.DayOfWeek <= 7 ? dayNames[cc.DayOfWeek] : "";
                    var schedule = $"{dayName}, tiết {cc.StartPeriod}-{cc.EndPeriod}";
                    var room = !string.IsNullOrEmpty(cc.Room?.RoomCode) && !string.IsNullOrEmpty(cc.Room?.RoomName)
                        ? $"{cc.Room.RoomCode} - {cc.Room.RoomName}"
                        : cc.Room?.RoomCode ?? cc.Room?.RoomName ?? "Chưa xếp phòng";
                    var enrollmentCount = _courseRepository.GetEnrollmentCountByCourseClassIdAsync(cc.CourseClassId).Result;

                    return new CourseClassInfoDto
                    {
                        CourseClassId = cc.CourseClassId,
                        CourseClassCode = cc.CourseClassCode ?? $"LHP{cc.CourseClassId.ToString().Substring(0, 8)}",
                        InstructorName = cc.Instructor?.Person?.FullName ?? "Chưa phân công",
                        RoomCode = cc.Room?.RoomCode ?? "",
                        RoomName = cc.Room?.RoomName ?? "",
                        Room = room,
                        Schedule = schedule,
                        Status = cc.CourseClassStatus,
                        DayOfWeek = cc.DayOfWeek,
                        StartPeriod = cc.StartPeriod,
                        EndPeriod = cc.EndPeriod,
                        DateStart = cc.DateStart.ToDateTime(TimeOnly.MinValue),
                        DateEnd = cc.DateEnd.ToDateTime(TimeOnly.MinValue),
                        StartDate = cc.DateStart.ToString("yyyy-MM-dd"),
                        EndDate = cc.DateEnd.ToString("yyyy-MM-dd"),
                        MaxStudents = cc.MaxStudents,
                        CurrentStudents = enrollmentCount,
                        CurrentEnrollment = enrollmentCount,
                        CourseClassStatus = cc.CourseClassStatus
                    };
                }).ToList();

                // Extract academic year from semester name or use fallback
                var academicYear = "";
                if (!string.IsNullOrEmpty(course.Semester?.SemesterName))
                {
                    var semesterName = course.Semester.SemesterName;
                    var yearMatch = System.Text.RegularExpressions.Regex.Match(semesterName, @"(\d{4}-\d{4}|\d{4})");
                    academicYear = yearMatch.Success ? yearMatch.Value : "";
                }

                return new CourseDetailResponseDto
                {
                    CourseId = course.CourseId,

                    // Nested objects for structured access
                    Subject = new SubjectInfoDto
                    {
                        SubjectId = course.Subject.SubjectId,
                        SubjectName = course.Subject.SubjectName,
                        SubjectCode = course.Subject.SubjectCode,
                        Credits = course.Subject.Credits,
                        TheoryHours = course.Subject.TheoryHours ?? 0,
                        PracticeHours = course.Subject.PracticeHours ?? 0,
                        DepartmentId = course.Subject.DepartmentId ?? Guid.Empty,
                        DepartmentName = course.Subject.Department?.DepartmentName ?? ""
                    },
                    Semester = new CourseSemesterInfoDto
                    {
                        SemesterId = course.Semester.SemesterId,
                        SemesterName = course.Semester.SemesterName,
                        SemesterType = course.Semester.SemesterType,
                        StartDate = course.Semester.StartDate.ToDateTime(TimeOnly.MinValue),
                        EndDate = course.Semester.EndDate.ToDateTime(TimeOnly.MinValue),
                        RegistrationStartDate = course.Semester.RegistrationStartDate.ToDateTime(TimeOnly.MinValue),
                        RegistrationEndDate = course.Semester.RegistrationEndDate.ToDateTime(TimeOnly.MinValue)
                    },

                    // Flattened properties for backward compatibility and easy display
                    CourseName = course.Subject.SubjectName,
                    CourseCode = course.CourseCode ?? course.Subject.SubjectCode,
                    SubjectName = course.Subject.SubjectName,
                    SubjectCode = course.Subject.SubjectCode,
                    Credits = course.Subject.Credits,
                    SemesterName = course.Semester.SemesterName,
                    AcademicYear = academicYear,

                    FeePerCredit = course.FeePerCredit,
                    TotalFee = course.Subject.Credits * course.FeePerCredit,
                    CourseStatus = course.CourseStatus,
                    CourseClasses = courseClassDtos,
                    CreatedAt = course.CreatedAt,
                    UpdatedAt = course.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy chi tiết khóa học {courseId}");
                throw;
            }
        }

        public async Task<CourseResponseDto> CreateCourseAsync(CreateCourseRequestDto request, Guid createdBy)
        {
            try
            {
                // Validate subject exists
                var subject = await _courseRepository.GetSubjectAsync(request.SubjectId);
                if (subject == null)
                    throw new InvalidOperationException("Môn học không tồn tại");

                // Validate semester exists and is active
                var semester = await _courseRepository.GetSemesterAsync(request.SemesterId);
                if (semester == null)
                    throw new InvalidOperationException("Học kỳ không tồn tại");

                if (semester.SemesterStatus == "completed")
                    throw new InvalidOperationException("Không thể tạo khóa học cho học kỳ đã hoàn thành");

                // Check for duplicate course
                if (await _courseRepository.ExistsAsync(request.SubjectId, request.SemesterId))
                    throw new InvalidOperationException("Khóa học cho môn học này trong học kỳ này đã tồn tại");

                // Validate fee
                if (request.FeePerCredit < 0)
                    throw new InvalidOperationException("Học phí không thể âm");

                if (request.FeePerCredit > 10000000)
                    throw new InvalidOperationException("Học phí vượt quá giới hạn cho phép (10,000,000 VND)");

                // Validate status
                var validStatuses = new[] { "active", "inactive", "completed", "cancelled" };
                if (!validStatuses.Contains(request.CourseStatus))
                    throw new InvalidOperationException("Trạng thái khóa học không hợp lệ");

                var course = new Course
                {
                    SubjectId = request.SubjectId,
                    SemesterId = request.SemesterId,
                    CourseCode = request.CourseCode,
                    FeePerCredit = request.FeePerCredit,
                    CourseStatus = request.CourseStatus
                };

                var createdCourse = await _courseRepository.CreateAsync(course, createdBy);

                return new CourseResponseDto
                {
                    CourseId = createdCourse.CourseId,
                    SubjectId = createdCourse.SubjectId,
                    SubjectName = subject.SubjectName,
                    SubjectCode = subject.SubjectCode,
                    Credits = subject.Credits,
                    SemesterId = createdCourse.SemesterId,
                    SemesterName = semester.SemesterName,
                    FeePerCredit = createdCourse.FeePerCredit,
                    TotalFee = subject.Credits * createdCourse.FeePerCredit,
                    CourseStatus = createdCourse.CourseStatus,
                    TotalClasses = 0,
                    TotalStudents = 0,
                    CreatedAt = createdCourse.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo khóa học");
                throw;
            }
        }

        public async Task<CourseResponseDto> UpdateCourseAsync(Guid courseId, UpdateCourseRequestDto request, Guid updatedBy)
        {
            try
            {
                // Get course with semester details for validation
                var course = await _courseRepository.GetDetailByIdAsync(courseId);
                if (course == null)
                    throw new InvalidOperationException("Không tìm thấy khóa học");

                // Specific update validation checks
                if (course.CourseStatus == "completed")
                    throw new InvalidOperationException("Không thể cập nhật khóa học đã hoàn thành");

                if (course.Semester.EndDate < DateOnly.FromDateTime(DateTime.UtcNow))
                    throw new InvalidOperationException("Không thể cập nhật khóa học của học kỳ đã kết thúc");

                // Validate fee
                if (request.FeePerCredit < 0)
                    throw new InvalidOperationException("Học phí không thể âm");

                if (request.FeePerCredit > 10000000)
                    throw new InvalidOperationException("Học phí vượt quá giới hạn cho phép (10,000,000 VND)");

                // Validate status
                var validStatuses = new[] { "active", "inactive", "completed", "cancelled" };
                if (!validStatuses.Contains(request.CourseStatus))
                    throw new InvalidOperationException("Trạng thái khóa học không hợp lệ");

                course.FeePerCredit = request.FeePerCredit;
                course.CourseStatus = request.CourseStatus;

                await _courseRepository.UpdateAsync(course, updatedBy);

                var subject = await _courseRepository.GetSubjectAsync(course.SubjectId);
                var semester = await _courseRepository.GetSemesterAsync(course.SemesterId);
                var (totalClasses, totalStudents, _) = await _courseRepository.GetCourseStatisticsAsync(courseId);

                return new CourseResponseDto
                {
                    CourseId = course.CourseId,
                    SubjectId = course.SubjectId,
                    SubjectName = subject?.SubjectName ?? "",
                    SubjectCode = subject?.SubjectCode ?? "",
                    Credits = subject?.Credits ?? 0,
                    SemesterId = course.SemesterId,
                    SemesterName = semester?.SemesterName ?? "",
                    FeePerCredit = course.FeePerCredit,
                    TotalFee = (subject?.Credits ?? 0) * course.FeePerCredit,
                    CourseStatus = course.CourseStatus,
                    TotalClasses = totalClasses,
                    TotalStudents = totalStudents,
                    CreatedAt = course.CreatedAt,
                    UpdatedAt = course.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi cập nhật khóa học {courseId}");
                throw;
            }
        }

        public async Task<bool> DeleteCourseAsync(Guid courseId, Guid deletedBy)
        {
            try
            {
                var course = await _courseRepository.GetByIdAsync(courseId);
                if (course == null)
                    throw new InvalidOperationException("Không tìm thấy khóa học");

                // Check if can delete
                if (!await _courseRepository.CanDeleteAsync(courseId))
                    throw new InvalidOperationException("Không thể xóa khóa học có sinh viên đang đăng ký hoặc có kỳ thi đã xuất bản");

                return await _courseRepository.SoftDeleteAsync(courseId, deletedBy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xóa khóa học {courseId}");
                throw;
            }
        }

        public async Task<CourseResponseDto> ChangeCourseStatusAsync(Guid courseId, ChangeCourseStatusRequestDto request, Guid updatedBy)
        {
            try
            {
                var course = await _courseRepository.GetByIdAsync(courseId);
                if (course == null)
                    throw new InvalidOperationException("Không tìm thấy khóa học");

                // Validate new status
                var validStatuses = new[] { "active", "inactive", "completed", "cancelled" };
                if (!validStatuses.Contains(request.CourseStatus))
                    throw new InvalidOperationException("Trạng thái khóa học không hợp lệ");

                // Check if can change status
                if (!await _courseRepository.CanChangeStatusAsync(courseId, request.CourseStatus))
                    throw new InvalidOperationException($"Không thể thay đổi trạng thái khóa học thành '{request.CourseStatus}'");

                await _courseRepository.ChangeStatusAsync(courseId, request.CourseStatus, updatedBy);

                var subject = await _courseRepository.GetSubjectAsync(course.SubjectId);
                var semester = await _courseRepository.GetSemesterAsync(course.SemesterId);
                var (totalClasses, totalStudents, _) = await _courseRepository.GetCourseStatisticsAsync(courseId);

                return new CourseResponseDto
                {
                    CourseId = course.CourseId,
                    SubjectId = course.SubjectId,
                    SubjectName = subject?.SubjectName ?? "",
                    SubjectCode = subject?.SubjectCode ?? "",
                    Credits = subject?.Credits ?? 0,
                    SemesterId = course.SemesterId,
                    SemesterName = semester?.SemesterName ?? "",
                    FeePerCredit = course.FeePerCredit,
                    TotalFee = (subject?.Credits ?? 0) * course.FeePerCredit,
                    CourseStatus = request.CourseStatus,
                    TotalClasses = totalClasses,
                    TotalStudents = totalStudents,
                    CreatedAt = course.CreatedAt,
                    UpdatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi thay đổi trạng thái khóa học {courseId}");
                throw;
            }
        }

        public async Task<CourseStatisticsDto> GetCourseStatisticsAsync(Guid courseId)
        {
            try
            {
                var course = await _courseRepository.GetByIdAsync(courseId);
                if (course == null)
                    throw new InvalidOperationException("Không tìm thấy khóa học");

                var (totalClasses, totalStudents, totalCapacity) = await _courseRepository.GetCourseStatisticsAsync(courseId);
                var courseClasses = await _courseRepository.GetCourseClassesAsync(courseId);

                var classBreakdown = courseClasses.Select(cc => new ClassBreakdownDto
                {
                    CourseClassId = cc.CourseClassId,
                    ClassName = $"Lớp {cc.CourseClassId.ToString().Substring(0, 8)}",
                    CurrentStudents = _courseRepository.GetEnrollmentCountAsync(courseId).Result,
                    MaxStudents = cc.MaxStudents,
                    OccupancyRate = cc.MaxStudents > 0
                        ? Math.Round((decimal)_courseRepository.GetEnrollmentCountAsync(courseId).Result / cc.MaxStudents * 100, 2)
                        : 0
                }).ToList();

                var subject = await _courseRepository.GetSubjectAsync(course.SubjectId);
                var totalRevenue = totalStudents * (subject?.Credits ?? 0) * course.FeePerCredit;

                return new CourseStatisticsDto
                {
                    CourseId = courseId,
                    TotalClasses = totalClasses,
                    TotalStudentsEnrolled = totalStudents,
                    AverageClassSize = totalClasses > 0 ? Math.Round((decimal)totalStudents / totalClasses, 2) : 0,
                    TotalCapacity = totalCapacity,
                    OccupancyRate = totalCapacity > 0 ? Math.Round((decimal)totalStudents / totalCapacity * 100, 2) : 0,
                    TotalRevenue = totalRevenue,
                    CourseClassesBreakdown = classBreakdown
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy thống kê khóa học {courseId}");
                throw;
            }
        }

        public async Task<CourseSummaryStatisticsDto> GetSummaryStatisticsAsync()
        {
            try
            {
                var (total, active, completed, cancelled, totalStudents, totalRevenue) =
                    await _courseRepository.GetSummaryStatisticsAsync();

                return new CourseSummaryStatisticsDto
                {
                    TotalCourses = total,
                    ActiveCourses = active,
                    CompletedCourses = completed,
                    CancelledCourses = cancelled,
                    TotalStudentsEnrolled = totalStudents,
                    TotalRevenue = totalRevenue
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy thống kê tổng quan");
                throw;
            }
        }

        // Course Class Management Methods Implementation

        public async Task<CourseClassResponseDto> CreateCourseClassAsync(CreateCourseClassRequestDto request, Guid createdBy)
        {
            try
            {
                _logger.LogInformation($"Creating course class for course {request.CourseId}");

                // Validate course exists and get course details
                var course = await _courseRepository.GetByIdAsync(request.CourseId);
                if (course == null)
                {
                    throw new InvalidOperationException("Khóa học không tồn tại");
                }

                // Validate room exists
                var room = await _courseRepository.GetRoomByIdAsync(request.RoomId);
                if (room == null)
                {
                    throw new InvalidOperationException("Phòng học không tồn tại");
                }

                // REMOVED: Validate instructor exists - no instructor at creation time

                // Validate start date within semester
                if (!await _courseRepository.IsDateWithinSemesterAsync(request.CourseId, request.StartDate))
                {
                    throw new InvalidOperationException("Ngày bắt đầu không nằm trong thời gian học kỳ");
                }

                // Calculate end date and day of week based on period range
                var (endDate, dayOfWeek) = await _courseRepository.CalculateEndDateAndDayOfWeekAsync(request.CourseId, request.StartDate, request.PeriodRange);

                // Get time periods for the course based on period range
                var (startPeriod, endPeriod) = await _courseRepository.GetTimePeriodsForCourseAsync(request.CourseId, request.PeriodRange);

                // Check for schedule conflicts (room only, no instructor yet)
                var hasRoomConflict = await _courseRepository.HasScheduleConflictAsync(
                    request.RoomId, request.StartDate, endDate, dayOfWeek, startPeriod, endPeriod);
                if (hasRoomConflict)
                {
                    throw new InvalidOperationException("Phòng học đã có lịch trùng với thời gian này");
                }

                // REMOVED: Check instructor conflict - no instructor assigned yet

                // Generate course class code
                var courseClassCode = await _courseRepository.GenerateCourseClassCodeAsync(request.CourseId);

                // Create course class entity WITHOUT instructor
                var courseClass = new CourseClass
                {
                    CourseId = request.CourseId,
                    RoomId = request.RoomId,
                    InstructorId = null, // No instructor assigned at creation
                    CourseClassCode = courseClassCode,
                    DateStart = request.StartDate,
                    DateEnd = endDate,
                    DayOfWeek = dayOfWeek,
                    StartPeriod = startPeriod,
                    EndPeriod = endPeriod,
                    MaxStudents = request.MaxStudents,
                    CourseClassStatus = "active"
                };

                var createdCourseClass = await _courseRepository.CreateCourseClassAsync(courseClass, createdBy);

                // Map to response DTO (instructor will be null)
                return await MapToCourseClassResponseDto(createdCourseClass, courseClassCode, course, room, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating course class for course {request.CourseId}");
                throw;
            }
        }

        public async Task<CourseClassResponseDto> UpdateCourseClassAsync(Guid courseClassId, UpdateCourseClassRequestDto request, Guid updatedBy)
        {
            try
            {
                _logger.LogInformation($"Updating course class {courseClassId}");

                var existingCourseClass = await _courseRepository.GetCourseClassByIdAsync(courseClassId);
                if (existingCourseClass == null)
                {
                    throw new InvalidOperationException("Lớp học không tồn tại");
                }

                // Validate room exists
                var room = await _courseRepository.GetRoomByIdAsync(request.RoomId);
                if (room == null)
                {
                    throw new InvalidOperationException("Phòng học không tồn tại");
                }

                // Validate start date within semester
                if (!await _courseRepository.IsDateWithinSemesterAsync(existingCourseClass.CourseId, request.StartDate))
                {
                    throw new InvalidOperationException("Ngày bắt đầu không nằm trong thời gian học kỳ");
                }

                // Calculate end date and day of week based on period range
                var (endDate, dayOfWeek) = await _courseRepository.CalculateEndDateAndDayOfWeekAsync(existingCourseClass.CourseId, request.StartDate, request.PeriodRange);

                // Get time periods for the course based on period range
                var (startPeriod, endPeriod) = await _courseRepository.GetTimePeriodsForCourseAsync(existingCourseClass.CourseId, request.PeriodRange);

                // Check for schedule conflicts (exclude current course class)
                var hasRoomConflict = await _courseRepository.HasScheduleConflictAsync(
                    request.RoomId, request.StartDate, endDate, dayOfWeek, startPeriod, endPeriod, courseClassId);
                if (hasRoomConflict)
                {
                    throw new InvalidOperationException("Phòng học đã có lịch trùng với thời gian này");
                }

                // Check instructor conflict only if instructor is already assigned
                if (existingCourseClass.InstructorId.HasValue)
                {
                    var hasInstructorConflict = await _courseRepository.HasInstructorConflictAsync(
                        existingCourseClass.InstructorId.Value, request.StartDate, endDate, dayOfWeek, startPeriod, endPeriod, courseClassId);
                    if (hasInstructorConflict)
                    {
                        throw new InvalidOperationException("Giảng viên đã có lịch dạy trùng với thời gian này");
                    }
                }

                // Update course class properties (DO NOT update InstructorId - use assign API)
                existingCourseClass.RoomId = request.RoomId;
                existingCourseClass.DateStart = request.StartDate;
                existingCourseClass.DateEnd = endDate;
                existingCourseClass.DayOfWeek = dayOfWeek;
                existingCourseClass.StartPeriod = startPeriod;
                existingCourseClass.EndPeriod = endPeriod;
                existingCourseClass.MaxStudents = request.MaxStudents;

                // Update status if provided
                if (!string.IsNullOrEmpty(request.CourseClassStatus))
                {
                    var validStatuses = new[] { "active", "inactive", "completed", "cancelled" };
                    if (!validStatuses.Contains(request.CourseClassStatus))
                        throw new InvalidOperationException("Trạng thái không hợp lệ");

                    existingCourseClass.CourseClassStatus = request.CourseClassStatus;
                }

                await _courseRepository.UpdateCourseClassAsync(existingCourseClass, updatedBy);

                // Get course for mapping
                var course = await _courseRepository.GetByIdAsync(existingCourseClass.CourseId);

                // Get existing instructor if assigned
                var instructor = existingCourseClass.InstructorId.HasValue
                    ? await _courseRepository.GetInstructorByIdAsync(existingCourseClass.InstructorId.Value)
                    : null;

                return await MapToCourseClassResponseDto(existingCourseClass, existingCourseClass.CourseClassCode, course, room, instructor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating course class {courseClassId}");
                throw;
            }
        }

        public async Task<bool> DeleteCourseClassAsync(Guid courseClassId, Guid deletedBy)
        {
            try
            {
                _logger.LogInformation($"Deleting course class {courseClassId}");

                var courseClass = await _courseRepository.GetCourseClassByIdAsync(courseClassId);
                if (courseClass == null)
                {
                    throw new InvalidOperationException("Lớp học không tồn tại");
                }

                // Check if there are active enrollments
                var enrollmentCount = await _courseRepository.GetEnrollmentCountByCourseClassIdAsync(courseClassId);
                if (enrollmentCount > 0)
                {
                    throw new InvalidOperationException("Không thể xóa lớp học đã có sinh viên đăng ký");
                }

                return await _courseRepository.DeleteCourseClassAsync(courseClassId, deletedBy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting course class {courseClassId}");
                throw;
            }
        }

        public async Task<CourseClassDetailResponseDto?> GetCourseClassDetailAsync(Guid courseClassId, bool showStudents = false)
        {
            try
            {
                var courseClass = await _courseRepository.GetCourseClassDetailByIdAsync(courseClassId);
                if (courseClass == null)
                {
                    return null;
                }

                return await MapToCourseClassDetailResponseDto(courseClass, showStudents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting course class detail {courseClassId}");
                throw;
            }
        }

        public async Task<ScheduleSuggestionResponseDto> GetScheduleSuggestionsAsync(DateOnly date, Guid? buildingId = null, string? roomType = null)
        {
            try
            {
                var dayOfWeek = (int)date.DayOfWeek == 0 ? 7 : (int)date.DayOfWeek; // Convert Sunday from 0 to 7
                var suggestions = new List<PeriodSuggestionDto>();

                // Define time periods
                var periods = new[]
                {
                    new { Period = "morning", StartPeriod = 1, EndPeriod = 5, StartTime = new TimeOnly(7, 0), EndTime = new TimeOnly(11, 30) },
                    new { Period = "afternoon", StartPeriod = 6, EndPeriod = 10, StartTime = new TimeOnly(13, 30), EndTime = new TimeOnly(17, 0) },
                    new { Period = "evening", StartPeriod = 11, EndPeriod = 14, StartTime = new TimeOnly(18, 30), EndTime = new TimeOnly(21, 30) }
                };

                foreach (var period in periods)
                {
                    var availableRooms = await _courseRepository.GetAvailableRoomsAsync(
                        date, dayOfWeek, period.StartPeriod, period.EndPeriod, buildingId, roomType);

                    foreach (var room in availableRooms)
                    {
                        suggestions.Add(new PeriodSuggestionDto
                        {
                            RoomId = room.RoomId,
                            RoomName = room.RoomName ?? "",
                            RoomType = room.RoomType ?? "",
                            BuildingName = room.Building?.BuildingName ?? "",
                            Capacity = room.Capacity,
                            Period = period.Period,
                            StartTime = period.StartTime,
                            EndTime = period.EndTime,
                            StartPeriod = period.StartPeriod,
                            EndPeriod = period.EndPeriod,
                            IsAvailable = true
                        });
                    }
                }

                return new ScheduleSuggestionResponseDto
                {
                    Suggestions = suggestions,
                    RequestedDate = date,
                    DayOfWeek = GetDayOfWeekName(dayOfWeek),
                    TotalSuggestions = suggestions.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting schedule suggestions for date {date}");
                throw;
            }
        }

        // Helper methods

        private async Task<CourseClassResponseDto> MapToCourseClassResponseDto(CourseClass courseClass, string courseClassCode, Course? course, Room? room, InstructorEntity? instructor)
        {
            var enrolledStudents = await _courseRepository.GetEnrollmentCountByCourseClassIdAsync(courseClass.CourseClassId);
            var startTime = GetTimeFromPeriod(courseClass.StartPeriod);
            var endTime = GetTimeFromPeriod(courseClass.EndPeriod + 1);

            return new CourseClassResponseDto
            {
                CourseClassId = courseClass.CourseClassId,
                CourseClassCode = courseClassCode,
                CourseId = courseClass.CourseId,
                CourseName = course?.Subject?.SubjectName ?? "",
                RoomId = courseClass.RoomId,
                RoomName = room?.RoomName ?? "",
                BuildingName = room?.Building?.BuildingName ?? "",
                InstructorId = courseClass.InstructorId ?? Guid.Empty,
                InstructorName = instructor?.Person?.FullName ?? "",
                StartDate = courseClass.DateStart,
                EndDate = courseClass.DateEnd,
                StartTime = startTime,
                EndTime = endTime,
                DayOfWeek = GetDayOfWeekName(courseClass.DayOfWeek),
                MaxStudents = courseClass.MaxStudents,
                EnrolledStudents = enrolledStudents,
                Status = courseClass.CourseClassStatus ?? "active",
                CreatedAt = courseClass.CreatedAt,
                UpdatedAt = courseClass.UpdatedAt
            };
        }

        private async Task<CourseClassDetailResponseDto> MapToCourseClassDetailResponseDto(CourseClass courseClass, bool showStudents = false)
        {
            var course = await _courseRepository.GetByIdAsync(courseClass.CourseId);
            var room = await _courseRepository.GetRoomByIdAsync(courseClass.RoomId);
            var instructor = courseClass.InstructorId.HasValue ? await _courseRepository.GetInstructorByIdAsync(courseClass.InstructorId.Value) : null;
            var enrolledStudents = await _courseRepository.GetEnrollmentCountByCourseClassIdAsync(courseClass.CourseClassId);
            var startTime = GetTimeFromPeriod(courseClass.StartPeriod);
            var endTime = GetTimeFromPeriod(courseClass.EndPeriod + 1);

            // Get students list if requested
            List<CourseClassStudentDto>? students = null;
            if (showStudents)
            {
                students = await GetStudentsByCourseClassIdAsync(courseClass.CourseClassId);
            }

            return new CourseClassDetailResponseDto
            {
                CourseClassId = courseClass.CourseClassId,
                CourseClassCode = courseClass.CourseClassCode,
                CourseId = courseClass.CourseId,
                CourseName = course?.Subject?.SubjectName ?? "",
                CourseCode = course?.CourseCode ?? "",
                SubjectCode = course?.Subject?.SubjectCode ?? "",
                SubjectName = course?.Subject?.SubjectName ?? "",
                Credits = course?.Subject?.Credits ?? 0,
                SemesterName = course?.Semester?.SemesterName ?? "",
                AcademicYear = course?.Semester?.AcademicYear?.YearName ?? "",
                RoomId = courseClass.RoomId,
                RoomName = room?.RoomName ?? "",
                RoomCode = room?.RoomCode ?? "",
                RoomType = room?.RoomType ?? "",
                RoomCapacity = room?.Capacity ?? 0,
                BuildingName = room?.Building?.BuildingName ?? "",
                InstructorId = courseClass.InstructorId ?? Guid.Empty,
                InstructorName = instructor?.Person?.FullName ?? "",
                InstructorCode = instructor?.InstructorCode ?? "",
                InstructorEmail = instructor?.Person?.Email ?? "",
                InstructorAssignedDate = courseClass.InstructorAssignedAt.HasValue
                    ? DateOnly.FromDateTime(courseClass.InstructorAssignedAt.Value)
                    : null,
                Note = courseClass.Note,
                StartDate = courseClass.DateStart,
                EndDate = courseClass.DateEnd,
                StartTime = startTime,
                EndTime = endTime,
                StartPeriod = courseClass.StartPeriod,
                EndPeriod = courseClass.EndPeriod,
                Period = GetPeriodName(courseClass.StartPeriod),
                DayOfWeek = GetDayOfWeekName(courseClass.DayOfWeek),
                MaxStudents = courseClass.MaxStudents,
                EnrolledStudents = enrolledStudents,
                Status = courseClass.CourseClassStatus ?? "active",
                FeePerCredit = course?.FeePerCredit ?? 0,
                TotalFee = course?.FeePerCredit * course?.Subject?.Credits ?? 0,
                FillRate = courseClass.MaxStudents > 0 ? Math.Round((double)enrolledStudents / courseClass.MaxStudents * 100, 2) : 0,
                Students = students,
                CreatedAt = courseClass.CreatedAt,
                UpdatedAt = courseClass.UpdatedAt
            };
        }

        private static string GetDayOfWeekName(int dayOfWeek)
        {
            return dayOfWeek switch
            {
                2 => "Thứ 2",
                3 => "Thứ 3",
                4 => "Thứ 4",
                5 => "Thứ 5",
                6 => "Thứ 6",
                7 => "Thứ 7",
                8 => "Chủ nhật",
                _ => ""
            };
        }

        private static string GetPeriodName(int startPeriod)
        {
            return startPeriod switch
            {
                >= 1 and <= 5 => "morning",
                >= 6 and <= 10 => "afternoon",
                >= 11 and <= 14 => "evening",
                _ => ""
            };
        }

        private static TimeOnly GetTimeFromPeriod(int period)
        {
            // Each period is 45 minutes, starting from 7:00 AM
            var startHour = 7;
            var totalMinutes = (period - 1) * 45;
            var hours = startHour + totalMinutes / 60;
            var minutes = totalMinutes % 60;

            // Handle special cases for afternoon and evening periods
            if (period >= 6 && period <= 10) // Afternoon: 13:30-17:00
            {
                startHour = 13;
                totalMinutes = (period - 6) * 52 + 30; // 52.5 minutes per period in afternoon
                hours = startHour + totalMinutes / 60;
                minutes = totalMinutes % 60;
            }
            else if (period >= 11 && period <= 14) // Evening: 18:30-21:30
            {
                startHour = 18;
                totalMinutes = (period - 11) * 45 + 30;
                hours = startHour + totalMinutes / 60;
                minutes = totalMinutes % 60;
            }

            return new TimeOnly(Math.Min(hours, 23), Math.Min(minutes, 59));
        }

        private async Task<List<CourseClassStudentDto>> GetStudentsByCourseClassIdAsync(Guid courseClassId)
        {
            var studentsData = await _courseRepository.GetStudentsByCourseClassIdAsync(courseClassId);

            return studentsData.Select(s => new CourseClassStudentDto
            {
                StudentId = s.StudentId,
                StudentCode = s.StudentCode,
                FullName = s.FullName,
                Email = s.Email,
                PhoneNumber = s.PhoneNumber,
                EnrollmentStatus = s.EnrollmentStatus,
                EnrollmentDate = s.EnrollmentDate
            }).ToList();
        }
    }
}