using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduManagement.Core.Application.DTOs.CourseClass;
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Application.Interfaces.Services;
using EduManagement.Core.Domain.Entities;
using EduManagement.Shared.Exceptions;

namespace EduManagement.Core.Application.Services;

public class CourseClassService : ICourseClassService
{
    private readonly ICourseClassRepository _courseClassRepository;

    public CourseClassService(ICourseClassRepository courseClassRepository)
    {
        _courseClassRepository = courseClassRepository;
    }

    public async Task<CourseClassDto> GetByIdAsync(Guid id)
    {
        var courseClass = await _courseClassRepository.GetByIdWithDetailsAsync(id);
        if (courseClass == null)
            throw new AppException("Không tìm thấy lớp học phần");

        return MapToDto(courseClass);
    }

    public async Task<CourseClassListResponseDto> GetAllAsync(CourseClassFilterDto filter)
    {
        var courseClasses = await _courseClassRepository.GetAllWithDetailsAsync(filter);
        var totalCount = await _courseClassRepository.GetTotalCountAsync(filter);

        return new CourseClassListResponseDto
        {
            Items = courseClasses.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<CourseClassDto> CreateAsync(CreateCourseClassDto dto)
    {
        // Validate input (remove instructor validation)
        ValidateInput(dto);

        // Validate schedule conflicts (without instructor)
        var validationDto = new ValidateScheduleDto
        {
            RoomId = dto.RoomId,
            InstructorId = null, // No instructor yet
            DateStart = dto.DateStart,
            DateEnd = dto.DateEnd,
            DayOfWeek = dto.DayOfWeek,
            StartPeriod = dto.StartPeriod,
            EndPeriod = dto.EndPeriod
        };

        var validationResult = await ValidateScheduleAsync(validationDto);
        if (!validationResult.IsValid)
        {
            var conflictMessages = validationResult.Conflicts
                .Select(c => $"{c.Type}: {c.ConflictingCourseClass.SubjectName}");
            throw new ValidationException($"Có xung đột lịch học: {string.Join(", ", conflictMessages)}");
        }

        // Create course class WITHOUT instructor
        var courseClass = new CourseClass
        {
            CourseId = dto.CourseId,
            InstructorId = null, // Will be assigned later
            InstructorAssignedAt = null,
            RoomId = dto.RoomId,
            DateStart = dto.DateStart,
            DateEnd = dto.DateEnd,
            MaxStudents = dto.MaxStudents,
            DayOfWeek = dto.DayOfWeek,
            StartPeriod = dto.StartPeriod,
            EndPeriod = dto.EndPeriod,
            Note = null
        };

        var created = await _courseClassRepository.CreateAsync(courseClass);

        return await GetByIdAsync(created.CourseClassId);
    }

    public async Task<CourseClassDto> UpdateAsync(Guid id, UpdateCourseClassDto dto)
    {
        var courseClass = await _courseClassRepository.GetByIdAsync(id);
        if (courseClass == null)
            throw new AppException("Không tìm thấy lớp học phần");

        // Check if has enrollments
        var hasEnrollments = await _courseClassRepository.HasEnrollmentsAsync(id);
        if (hasEnrollments)
            throw new ValidationException("Không thể chỉnh sửa lớp học phần đã có sinh viên đăng ký");

        // Validate input
        ValidateUpdateInput(dto);

        // Validate schedule conflicts
        var validationDto = new ValidateScheduleDto
        {
            RoomId = dto.RoomId,
            InstructorId = dto.InstructorId,
            DateStart = dto.DateStart,
            DateEnd = dto.DateEnd,
            DayOfWeek = dto.DayOfWeek,
            StartPeriod = dto.StartPeriod,
            EndPeriod = dto.EndPeriod,
            ExcludeCourseClassId = id
        };

        var validationResult = await ValidateScheduleAsync(validationDto);
        if (!validationResult.IsValid)
        {
            var conflictMessages = validationResult.Conflicts
                .Select(c => $"{c.Type}: {c.ConflictingCourseClass.SubjectName}");
            throw new ValidationException($"Có xung đột lịch học: {string.Join(", ", conflictMessages)}");
        }

        // Update course class
        courseClass.InstructorId = dto.InstructorId;
        courseClass.RoomId = dto.RoomId;
        courseClass.DateStart = dto.DateStart;
        courseClass.DateEnd = dto.DateEnd;
        courseClass.MaxStudents = dto.MaxStudents;
        courseClass.DayOfWeek = dto.DayOfWeek;
        courseClass.StartPeriod = dto.StartPeriod;
        courseClass.EndPeriod = dto.EndPeriod;
        
        // Update status if provided
        if (!string.IsNullOrEmpty(dto.CourseClassStatus))
        {
            var validStatuses = new[] { "active", "inactive", "completed", "cancelled" };
            if (!validStatuses.Contains(dto.CourseClassStatus))
                throw new ValidationException("Trạng thái không hợp lệ");
            
            courseClass.CourseClassStatus = dto.CourseClassStatus;
        }

        await _courseClassRepository.UpdateAsync(courseClass);

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var courseClass = await _courseClassRepository.GetByIdAsync(id);
        if (courseClass == null)
            throw new AppException("Không tìm thấy lớp học phần");

        // Check if has enrollments
        var hasEnrollments = await _courseClassRepository.HasEnrollmentsAsync(id);
        if (hasEnrollments)
            throw new ValidationException("Không thể hủy lớp học phần đã có sinh viên đăng ký");

        return await _courseClassRepository.DeleteAsync(id);
    }

    public async Task<ValidationResultDto> ValidateScheduleAsync(ValidateScheduleDto dto)
    {
        var result = new ValidationResultDto { IsValid = true };

        // Get all conflicts
        var conflicts = await _courseClassRepository.GetConflictingClassesAsync(dto);

        if (conflicts.Any())
        {
            result.IsValid = false;
            result.Conflicts = conflicts.Select(c => new ConflictDto
            {
                Type = !string.IsNullOrEmpty(c.RoomCode) ? "room_conflict" : "instructor_conflict",
                ConflictingCourseClass = c
            }).ToList();
        }

        // Check exam schedule conflict
        if (await _courseClassRepository.HasExamScheduleConflictAsync(dto))
        {
            result.IsValid = false;
            result.Conflicts.Add(new ConflictDto
            {
                Type = "exam_schedule_conflict",
                ConflictingCourseClass = new ConflictingCourseClassDto
                {
                    SubjectName = "Lịch thi",
                    DayOfWeek = dto.DayOfWeek,
                    Periods = $"{dto.StartPeriod}-{dto.EndPeriod}"
                }
            });
        }

        // Check schedule change conflict
        if (await _courseClassRepository.HasScheduleChangeConflictAsync(dto))
        {
            result.IsValid = false;
            result.Conflicts.Add(new ConflictDto
            {
                Type = "schedule_change_conflict",
                ConflictingCourseClass = new ConflictingCourseClassDto
                {
                    SubjectName = "Lịch học bù",
                    DayOfWeek = dto.DayOfWeek,
                    Periods = $"{dto.StartPeriod}-{dto.EndPeriod}"
                }
            });
        }

        // Check room booking conflict
        if (await _courseClassRepository.HasRoomBookingConflictAsync(dto))
        {
            result.IsValid = false;
            result.Conflicts.Add(new ConflictDto
            {
                Type = "room_booking_conflict",
                ConflictingCourseClass = new ConflictingCourseClassDto
                {
                    SubjectName = "Phòng đã được đặt",
                    DayOfWeek = dto.DayOfWeek,
                    Periods = $"{dto.StartPeriod}-{dto.EndPeriod}"
                }
            });
        }

        return result;
    }

    public async Task<List<RoomInfoDto>> GetAvailableRoomsAsync(AvailableRoomsQueryDto query)
    {
        var rooms = await _courseClassRepository.GetAvailableRoomsAsync(query);
        return rooms.Select(r => new RoomInfoDto
        {
            RoomId = r.RoomId,
            RoomCode = r.RoomCode ?? "N/A",
            RoomName = r.RoomName ?? "N/A",
            Capacity = r.Capacity,
            BuildingName = r.Building?.BuildingName ?? "N/A"
        }).ToList();
    }

    public async Task<bool> PublishAsync(Guid id)
    {
        var courseClass = await _courseClassRepository.GetByIdWithDetailsAsync(id);
        if (courseClass == null)
            throw new AppException("Không tìm thấy lớp học phần");

        // Validate no conflicts
        var validationDto = new ValidateScheduleDto
        {
            RoomId = courseClass.RoomId,
            InstructorId = courseClass.InstructorId,
            DateStart = courseClass.DateStart,
            DateEnd = courseClass.DateEnd,
            DayOfWeek = courseClass.DayOfWeek,
            StartPeriod = courseClass.StartPeriod,
            EndPeriod = courseClass.EndPeriod,
            ExcludeCourseClassId = id
        };

        var validationResult = await ValidateScheduleAsync(validationDto);
        if (!validationResult.IsValid)
            throw new ValidationException("Không thể công bố lớp học phần có xung đột lịch");

        return true;
    }

    private void ValidateInput(CreateCourseClassDto dto)
    {
        if (dto.CourseId == Guid.Empty)
            throw new ValidationException("Vui lòng chọn khóa học");

        if (dto.RoomId == Guid.Empty)
            throw new ValidationException("Vui lòng chọn phòng học");

        if (dto.DayOfWeek < 2 || dto.DayOfWeek > 8)
            throw new ValidationException("Thứ phải từ 2 đến 8 (Chủ nhật)");

        if (dto.StartPeriod < 1 || dto.StartPeriod > 16)
            throw new ValidationException("Tiết bắt đầu phải từ 1 đến 16");

        if (dto.EndPeriod < 1 || dto.EndPeriod > 16)
            throw new ValidationException("Tiết kết thúc phải từ 1 đến 16");

        if (dto.EndPeriod <= dto.StartPeriod)
            throw new ValidationException("Tiết kết thúc phải lớn hơn tiết bắt đầu");

        if (dto.DateEnd <= dto.DateStart)
            throw new ValidationException("Ngày kết thúc phải sau ngày bắt đầu");

        if (dto.MaxStudents <= 0)
            throw new ValidationException("Số lượng sinh viên tối đa phải lớn hơn 0");
    }

    private void ValidateUpdateInput(UpdateCourseClassDto dto)
    {
        if (dto.RoomId == Guid.Empty)
            throw new ValidationException("Vui lòng chọn phòng học");

        if (dto.DayOfWeek < 2 || dto.DayOfWeek > 8)
            throw new ValidationException("Thứ phải từ 2 đến 8 (Chủ nhật)");

        if (dto.StartPeriod < 1 || dto.StartPeriod > 16)
            throw new ValidationException("Tiết bắt đầu phải từ 1 đến 16");

        if (dto.EndPeriod < 1 || dto.EndPeriod > 16)
            throw new ValidationException("Tiết kết thúc phải từ 1 đến 16");

        if (dto.EndPeriod <= dto.StartPeriod)
            throw new ValidationException("Tiết kết thúc phải lớn hơn tiết bắt đầu");

        if (dto.DateEnd <= dto.DateStart)
            throw new ValidationException("Ngày kết thúc phải sau ngày bắt đầu");

        if (dto.MaxStudents <= 0)
            throw new ValidationException("Số lượng sinh viên tối đa phải lớn hơn 0");
    }

    private CourseClassDto MapToDto(CourseClass courseClass)
    {
        var currentEnrollment = courseClass.StudentEnrollments?.Count(e => e.EnrollmentStatus == "registered") ?? 0;

        return new CourseClassDto
        {
            CourseClassId = courseClass.CourseClassId,
            
            Course = courseClass.Course != null ? new CourseInfoDto
            {
                CourseId = courseClass.CourseId,
                SubjectCode = courseClass.Course.Subject?.SubjectCode ?? "N/A",
                SubjectName = courseClass.Course.Subject?.SubjectName ?? "N/A",
                Credits = courseClass.Course.Subject?.Credits ?? 0,
                SemesterId = courseClass.Course.SemesterId,
                SemesterName = courseClass.Course.Semester?.SemesterName ?? "N/A"
            } : new CourseInfoDto
            {
                CourseId = courseClass.CourseId,
                SubjectCode = "N/A",
                SubjectName = "N/A",
                Credits = 0,
                SemesterId = Guid.Empty,
                SemesterName = "N/A"
            },
            
            Instructor = courseClass.Instructor != null ? new InstructorInfoDto
            {
                InstructorId = courseClass.InstructorId ?? Guid.Empty,
                FullName = courseClass.Instructor.Person?.FullName ?? "N/A",
                InstructorCode = courseClass.Instructor.InstructorCode ?? "N/A",
                Email = courseClass.Instructor.Person?.Email ?? "N/A"
            } : (courseClass.InstructorId.HasValue ? new InstructorInfoDto
            {
                InstructorId = courseClass.InstructorId.Value,
                FullName = "N/A",
                InstructorCode = "N/A",
                Email = "N/A"
            } : null),
            
            Room = courseClass.Room != null ? new RoomInfoDto
            {
                RoomId = courseClass.RoomId,
                RoomCode = courseClass.Room.RoomCode ?? "N/A",
                RoomName = courseClass.Room.RoomName ?? "N/A",
                Capacity = courseClass.Room.Capacity,
                BuildingName = courseClass.Room.Building?.BuildingName ?? "N/A"
            } : new RoomInfoDto
            {
                RoomId = courseClass.RoomId,
                RoomCode = "N/A",
                RoomName = "N/A",
                Capacity = 0,
                BuildingName = "N/A"
            },
            
            Schedule = new ScheduleInfoDto
            {
                DayOfWeek = courseClass.DayOfWeek,
                StartPeriod = courseClass.StartPeriod,
                EndPeriod = courseClass.EndPeriod,
                DateStart = courseClass.DateStart,
                DateEnd = courseClass.DateEnd,
                DayOfWeekName = GetDayOfWeekName(courseClass.DayOfWeek),
                PeriodRange = $"Tiết {courseClass.StartPeriod}-{courseClass.EndPeriod}"
            },
            
            EnrollmentInfo = new EnrollmentInfoDto
            {
                CurrentStudents = currentEnrollment,
                MaxStudents = courseClass.MaxStudents,
                IsFull = currentEnrollment >= courseClass.MaxStudents
            },
            
            CourseClassStatus = courseClass.CourseClassStatus ?? "unknown",
            
            // ADD THESE MISSING FIELDS:
            InstructorAssignedAt = courseClass.InstructorAssignedAt.HasValue 
                ? DateOnly.FromDateTime(courseClass.InstructorAssignedAt.Value) 
                : null,
            Note = courseClass.Note
        };
    }

    private string GetDayOfWeekName(int dayOfWeek)
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
            _ => "Không xác định"
        };
    }

    /// <summary>
    /// Get available time slots with comprehensive filtering
    /// </summary>
    public async Task<AvailableSlotResponseDto> GetAvailableTimeSlotsAsync(AvailableSlotQueryDto query)
    {
        // Validate input
        if (query.DateEnd <= query.DateStart)
            throw new ValidationException("Ngày kết thúc phải sau ngày bắt đầu");

        // Get available slots from repository
        var availableSlots = await _courseClassRepository.GetAvailableTimeSlotsAsync(query);

        // Count total available slots
        var totalSlots = availableSlots.Sum(room => room.AvailableTimeSlots.Count(ts => ts.IsAvailable));

        return new AvailableSlotResponseDto
        {
            AvailableSlots = availableSlots,
            TotalSlots = totalSlots
        };
    }

    /// <summary>
    /// Get available instructors who are free to teach at the specified time
    /// </summary>
    public async Task<AvailableInstructorsResponseDto> GetAvailableInstructorsAsync(AvailableInstructorsQueryDto query)
    {
        // Validate input
        if (query.SemesterId == Guid.Empty)
            throw new ValidationException("Vui lòng chọn học kỳ");
        
        if (query.SubjectId == Guid.Empty)
            throw new ValidationException("Vui lòng chọn môn học");
        
        if (query.DayOfWeek < 2 || query.DayOfWeek > 8)
            throw new ValidationException("Thứ phải từ 2 đến 8 (Chủ nhật)");
        
        if (string.IsNullOrWhiteSpace(query.PeriodRange))
            throw new ValidationException("Vui lòng chọn khung giờ học (morning/afternoon/evening)");
        
        // Validate and get period range
        (int startPeriod, int endPeriod, string description) periodInfo;
        try
        {
            periodInfo = PeriodRangeHelper.GetPeriodRange(query.PeriodRange);
        }
        catch (ArgumentException ex)
        {
            throw new ValidationException(ex.Message);
        }
        
        // Get available instructors from repository
        var instructors = await _courseClassRepository.GetAvailableInstructorsAsync(query);
        
        // Get additional context information for response
        var subject = await GetSubjectInfoAsync(query.SubjectId);
        var semester = await GetSemesterInfoAsync(query.SemesterId);
        
        return new AvailableInstructorsResponseDto
        {
            Instructors = instructors,
            TotalCount = instructors.Count,
            PeriodRange = query.PeriodRange,
            PeriodRangeDescription = periodInfo.description,
            StartPeriod = periodInfo.startPeriod,
            EndPeriod = periodInfo.endPeriod,
            DayOfWeekName = PeriodRangeHelper.GetDayOfWeekName(query.DayOfWeek),
            SemesterName = semester?.SemesterName ?? "N/A",
            SubjectName = subject?.SubjectName ?? "N/A"
        };
    }

    /// <summary>
    /// Helper method to get subject information
    /// </summary>
    private async Task<SubjectContextDto?> GetSubjectInfoAsync(Guid subjectId)
    {
        // This would need to be implemented in your repository or service
        // For now, returning a placeholder
        // You should add this to your context or create a new query
        return new SubjectContextDto
        {
            SubjectId = subjectId,
            SubjectName = "Subject Name" // TODO: Get from database
        };
    }

    /// <summary>
    /// Helper method to get semester information
    /// </summary>
    private async Task<SemesterContextDto?> GetSemesterInfoAsync(Guid semesterId)
    {
        // This would need to be implemented in your repository or service
        // For now, returning a placeholder
        return new SemesterContextDto
        {
            SemesterId = semesterId,
            SemesterName = "Semester Name" // TODO: Get from database
        };
    }

    public async Task<AvailableInstructorsResponseDto> GetAvailableInstructorsForCourseClassAsync(Guid courseClassId)
    {
        // Get the course class with all necessary details
        var courseClass = await _courseClassRepository.GetByIdWithDetailsAsync(courseClassId);
        if (courseClass == null)
            throw new AppException("Không tìm thấy lớp học phần");

        if (courseClass.Course?.Subject == null)
            throw new AppException("Không tìm thấy thông tin môn học của lớp học phần");

        if (courseClass.Course.Semester == null)
            throw new AppException("Không tìm thấy thông tin học kỳ của lớp học phần");

        // Build query from course class information
        var query = new AvailableInstructorsQueryDto
        {
            SemesterId = courseClass.Course.SemesterId,
            SubjectId = courseClass.Course.SubjectId,
            DayOfWeek = courseClass.DayOfWeek,
            PeriodRange = DeterminePeriodRange(courseClass.StartPeriod, courseClass.EndPeriod),
            ExcludeCourseClassId = courseClassId // Exclude current course class from conflict checks
        };

        // Get available instructors
        var instructors = await _courseClassRepository.GetAvailableInstructorsAsync(query);

        // Get period range details
        var (startPeriod, endPeriod, description) = PeriodRangeHelper.GetPeriodRange(query.PeriodRange);

        return new AvailableInstructorsResponseDto
        {
            Instructors = instructors,
            TotalCount = instructors.Count,
            PeriodRange = query.PeriodRange,
            PeriodRangeDescription = description,
            StartPeriod = startPeriod,
            EndPeriod = endPeriod,
            DayOfWeekName = PeriodRangeHelper.GetDayOfWeekName(query.DayOfWeek),
            SemesterName = courseClass.Course.Semester.SemesterName ?? "N/A",
            SubjectName = courseClass.Course.Subject.SubjectName ?? "N/A"
        };
    }

    public async Task<CourseClassDto> AssignInstructorAsync(Guid courseClassId, AssignInstructorRequestDto dto)
    {
        var courseClass = await _courseClassRepository.GetByIdWithDetailsAsync(courseClassId);
        if (courseClass == null)
            throw new AppException("Không tìm thấy lớp học phần");

        // REMOVED: Don't check if already has instructor - just allow overwriting
        
        // Validate instructor exists and is available
        var query = new AvailableInstructorsQueryDto
        {
            SemesterId = courseClass.Course.SemesterId,
            SubjectId = courseClass.Course.SubjectId,
            DayOfWeek = courseClass.DayOfWeek,
            PeriodRange = DeterminePeriodRange(courseClass.StartPeriod, courseClass.EndPeriod),
            ExcludeCourseClassId = courseClassId // Exclude current course class from conflict checks
        };

        var availableInstructors = await _courseClassRepository.GetAvailableInstructorsAsync(query);
        
        // If instructor is already assigned to this class, they're obviously available
        var isCurrentInstructor = courseClass.InstructorId == dto.InstructorId;
        
        if (!isCurrentInstructor && !availableInstructors.Any(i => i.InstructorId == dto.InstructorId))
            throw new ValidationException("Giảng viên không khả dụng cho lớp học phần này");

        // Assign or reassign instructor
        courseClass.InstructorId = dto.InstructorId;
        courseClass.InstructorAssignedAt = dto.AssignedDate?.ToDateTime(TimeOnly.MinValue) ?? DateTime.UtcNow;
        courseClass.Note = dto.Note;
        courseClass.UpdatedAt = DateTime.UtcNow;

        await _courseClassRepository.UpdateAsync(courseClass);

        return await GetByIdAsync(courseClassId);
    }

    private string DeterminePeriodRange(int startPeriod, int endPeriod)
    {
        // Morning: periods 1-5
        if (startPeriod >= 1 && endPeriod <= 5)
            return "morning";
        
        // Afternoon: periods 6-9
        if (startPeriod >= 6 && endPeriod <= 9)
            return "afternoon";
        
        // Evening: periods 10-12
        if (startPeriod >= 10 && endPeriod <= 12)
            return "evening";
        
        throw new InvalidOperationException("Không thể xác định khung giờ học từ tiết học");
    }

    /// <summary>
    /// Get all course classes with advanced search and filtering
    /// </summary>
    public async Task<CourseClassAdvancedListResponseDto> GetAllAdvancedAsync(CourseClassAdvancedFilterDto filter)
    {
        var courseClasses = await _courseClassRepository.GetAllWithAdvancedFilterAsync(filter);
        var totalCount = await _courseClassRepository.GetTotalCountWithAdvancedFilterAsync(filter);

        var items = courseClasses.Select(cc => new CourseClassListItemDto
        {
            CourseClassId = cc.CourseClassId,
            CourseClassCode = cc.CourseClassCode,
            SubjectName = cc.Course.Subject?.SubjectName ?? "N/A",
            SubjectId = cc.Course.SubjectId,
            InstructorName = cc.Instructor?.Person?.FullName,
            InstructorId = cc.InstructorId,
            InstructorAssignedDate = cc.InstructorAssignedAt.HasValue 
                ? DateOnly.FromDateTime(cc.InstructorAssignedAt.Value) 
                : null,
            Note = cc.Note,
            StudentsEnrolled = cc.StudentEnrollments.Count(e => e.EnrollmentStatus == "registered"),
            MaxStudents = cc.MaxStudents,
            SemesterName = cc.Course.Semester?.SemesterName ?? "N/A",
            SemesterId = cc.Course.SemesterId,
            CourseClassStatus = cc.CourseClassStatus ?? "unknown",
            DayOfWeek = cc.DayOfWeek,
            DayOfWeekName = GetDayOfWeekName(cc.DayOfWeek),
            PeriodRange = $"Tiết {cc.StartPeriod}-{cc.EndPeriod}"
        }).ToList();

        return new CourseClassAdvancedListResponseDto
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    // Helper DTOs (add these to your DTOs file)
    private class SubjectContextDto
    {
        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
    }

    private class SemesterContextDto
    {
        public Guid SemesterId { get; set; }
        public string SemesterName { get; set; } = string.Empty;
    }
}