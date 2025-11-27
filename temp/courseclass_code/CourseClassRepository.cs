using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduManagement.Core.Application.DTOs.CourseClass;
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Domain.Entities;
using EduManagement.Infrastructure.Data;

namespace EduManagement.Infrastructure.Repositories;

public class CourseClassRepository : ICourseClassRepository
{
    private readonly EduManagementContext _context;

    public CourseClassRepository(EduManagementContext context)
    {
        _context = context;
    }

    public async Task<CourseClass?> GetByIdAsync(Guid id)
    {
        return await _context.CourseClasses
            .Where(cc => cc.CourseClassId == id && cc.IsActive && !cc.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<CourseClass?> GetByIdWithDetailsAsync(Guid id)
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
            .Include(cc => cc.StudentEnrollments.Where(e => e.EnrollmentStatus == "registered"))
            .Where(cc => cc.CourseClassId == id && cc.IsActive && !cc.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<List<CourseClass>> GetAllWithDetailsAsync(CourseClassFilterDto filter)
    {
        var query = _context.CourseClasses
            .Include(cc => cc.Course)
                .ThenInclude(c => c.Subject)
            .Include(cc => cc.Course)
                .ThenInclude(c => c.Semester)
            .Include(cc => cc.Instructor)
                .ThenInclude(i => i!.Person)
            .Include(cc => cc.Room)
                .ThenInclude(r => r!.Building)
            .Include(cc => cc.StudentEnrollments.Where(e => e.EnrollmentStatus == "registered"))
            .Where(cc => cc.IsActive && !cc.IsDeleted);

        if (filter.SemesterId.HasValue)
            query = query.Where(cc => cc.Course.SemesterId == filter.SemesterId.Value);

        if (filter.CourseId.HasValue)
            query = query.Where(cc => cc.CourseId == filter.CourseId.Value);

        if (filter.InstructorId.HasValue)
            query = query.Where(cc => cc.InstructorId == filter.InstructorId.Value);

        if (filter.RoomId.HasValue)
            query = query.Where(cc => cc.RoomId == filter.RoomId.Value);

        if (filter.DayOfWeek.HasValue)
            query = query.Where(cc => cc.DayOfWeek == filter.DayOfWeek.Value);

        if (!string.IsNullOrEmpty(filter.Status))
            query = query.Where(cc => cc.CourseClassStatus == filter.Status);

        return await query
            .OrderBy(cc => cc.DayOfWeek)
            .ThenBy(cc => cc.StartPeriod)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync(CourseClassFilterDto filter)
    {
        var query = _context.CourseClasses
            .Where(cc => cc.IsActive && !cc.IsDeleted);

        if (filter.SemesterId.HasValue)
            query = query.Where(cc => cc.Course.SemesterId == filter.SemesterId.Value);

        if (filter.CourseId.HasValue)
            query = query.Where(cc => cc.CourseId == filter.CourseId.Value);

        if (filter.InstructorId.HasValue)
            query = query.Where(cc => cc.InstructorId == filter.InstructorId.Value);

        if (filter.RoomId.HasValue)
            query = query.Where(cc => cc.RoomId == filter.RoomId.Value);

        if (filter.DayOfWeek.HasValue)
            query = query.Where(cc => cc.DayOfWeek == filter.DayOfWeek.Value);

        if (!string.IsNullOrEmpty(filter.Status))
            query = query.Where(cc => cc.CourseClassStatus == filter.Status);

        return await query.CountAsync();
    }

    public async Task<CourseClass> CreateAsync(CourseClass courseClass)
    {
        courseClass.CourseClassId = Guid.NewGuid();
        courseClass.CreatedAt = DateTime.UtcNow;
        courseClass.IsActive = true;
        courseClass.IsDeleted = false;
        courseClass.CourseClassStatus = "active";

        _context.CourseClasses.Add(courseClass);
        await _context.SaveChangesAsync();
        return courseClass;
    }

    public async Task<CourseClass> UpdateAsync(CourseClass courseClass)
    {
        courseClass.UpdatedAt = DateTime.UtcNow;
        _context.CourseClasses.Update(courseClass);
        await _context.SaveChangesAsync();
        return courseClass;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var courseClass = await GetByIdAsync(id);
        if (courseClass == null) return false;

        courseClass.IsActive = false;
        courseClass.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasRoomConflictAsync(ValidateScheduleDto dto)
    {
        return await _context.CourseClasses
            .AnyAsync(cc =>
                cc.RoomId == dto.RoomId &&
                cc.IsActive &&
                !cc.IsDeleted &&
                cc.CourseClassId != dto.ExcludeCourseClassId &&
                cc.DayOfWeek == dto.DayOfWeek &&
                cc.DateStart <= dto.DateEnd &&
                cc.DateEnd >= dto.DateStart &&
                cc.StartPeriod < dto.EndPeriod &&
                cc.EndPeriod > dto.StartPeriod);
    }

    public async Task<bool> HasInstructorConflictAsync(ValidateScheduleDto dto)
    {
        if (!dto.InstructorId.HasValue) return false;

        return await _context.CourseClasses
            .AnyAsync(cc =>
                cc.InstructorId == dto.InstructorId.Value &&
                cc.IsActive &&
                !cc.IsDeleted &&
                cc.CourseClassId != dto.ExcludeCourseClassId &&
                cc.DayOfWeek == dto.DayOfWeek &&
                cc.DateStart <= dto.DateEnd &&
                cc.DateEnd >= dto.DateStart &&
                cc.StartPeriod < dto.EndPeriod &&
                cc.EndPeriod > dto.StartPeriod);
    }

    public async Task<bool> HasExamScheduleConflictAsync(ValidateScheduleDto dto)
    {
        // Convert DateOnly to DateTime for comparison with exam start_time (DATETIME2)
        var startDateTime = dto.DateStart.ToDateTime(TimeOnly.MinValue);
        var endDateTime = dto.DateEnd.ToDateTime(TimeOnly.MaxValue);

        return await _context.ExamClasses
            .AnyAsync(ec =>
                ec.RoomId == dto.RoomId &&
                ec.IsActive &&
                !ec.IsDeleted &&
                ec.StartTime >= startDateTime &&
                ec.StartTime <= endDateTime &&
                // Check if exam day of week matches (DATEPART returns 1=Sunday, 2=Monday, etc.)
                // Our dto.DayOfWeek uses 2=Monday, 8=Sunday
                (dto.DayOfWeek == 8 ? 
                    EF.Functions.DateDiffDay(DateTime.MinValue, ec.StartTime) % 7 == 0 : 
                    EF.Functions.DateDiffDay(DateTime.MinValue, ec.StartTime) % 7 == (dto.DayOfWeek - 1) % 7));
    }

    public async Task<bool> HasScheduleChangeConflictAsync(ValidateScheduleDto dto)
    {
        return await _context.ScheduleChanges
            .Where(sc =>
                sc.MakeupRoomId == dto.RoomId &&
                sc.IsActive &&
                !sc.IsDeleted &&
                sc.MakeupDate.HasValue &&
                sc.DayOfWeek == dto.DayOfWeek &&
                sc.StartPeriod < dto.EndPeriod &&
                sc.EndPeriod > dto.StartPeriod)
            .AnyAsync(sc =>
                // MakeupDate is already DateOnly type
                sc.MakeupDate!.Value >= dto.DateStart &&
                sc.MakeupDate!.Value <= dto.DateEnd);
    }

    public async Task<bool> HasRoomBookingConflictAsync(ValidateScheduleDto dto)
    {
        return await _context.RoomBookings
            .AnyAsync(rb =>
                rb.RoomId == dto.RoomId &&
                rb.IsActive &&
                !rb.IsDeleted &&
                (rb.BookingStatus == "confirmed" || rb.BookingStatus == "pending") &&
                // BookingDate is already DateOnly type
                rb.BookingDate >= dto.DateStart &&
                rb.BookingDate <= dto.DateEnd);
    }

    public async Task<List<ConflictingCourseClassDto>> GetConflictingClassesAsync(ValidateScheduleDto dto)
    {
        var conflicts = new List<ConflictingCourseClassDto>();

        var roomConflicts = await _context.CourseClasses
            .Include(cc => cc.Course)
                .ThenInclude(c => c.Subject)
            .Include(cc => cc.Room)
            .Where(cc =>
                cc.RoomId == dto.RoomId &&
                cc.IsActive &&
                !cc.IsDeleted &&
                cc.CourseClassId != dto.ExcludeCourseClassId &&
                cc.DayOfWeek == dto.DayOfWeek &&
                cc.DateStart <= dto.DateEnd &&
                cc.DateEnd >= dto.DateStart &&
                cc.StartPeriod < dto.EndPeriod &&
                cc.EndPeriod > dto.StartPeriod)
            .Select(cc => new ConflictingCourseClassDto
            {
                CourseClassId = cc.CourseClassId,
                SubjectName = cc.Course.Subject.SubjectName,
                RoomCode = cc.Room.RoomCode,
                DayOfWeek = cc.DayOfWeek,
                Periods = $"{cc.StartPeriod}-{cc.EndPeriod}"
            })
            .ToListAsync();

        conflicts.AddRange(roomConflicts);

        if (dto.InstructorId.HasValue)
        {
            var instructorConflicts = await _context.CourseClasses
                .Include(cc => cc.Course)
                    .ThenInclude(c => c.Subject)
                .Include(cc => cc.Instructor)
                    .ThenInclude(i => i!.Person)
                .Where(cc =>
                    cc.InstructorId == dto.InstructorId.Value &&
                    cc.IsActive &&
                    !cc.IsDeleted &&
                    cc.CourseClassId != dto.ExcludeCourseClassId &&
                    cc.DayOfWeek == dto.DayOfWeek &&
                    cc.DateStart <= dto.DateEnd &&
                    cc.DateEnd >= dto.DateStart &&
                    cc.StartPeriod < dto.EndPeriod &&
                    cc.EndPeriod > dto.StartPeriod)
                .Select(cc => new ConflictingCourseClassDto
                {
                    CourseClassId = cc.CourseClassId,
                    SubjectName = cc.Course.Subject.SubjectName,
                    InstructorName = cc.Instructor!.Person.FullName,
                    DayOfWeek = cc.DayOfWeek,
                    Periods = $"{cc.StartPeriod}-{cc.EndPeriod}"
                })
                .ToListAsync();

            conflicts.AddRange(instructorConflicts);
        }

        return conflicts;
    }

    public async Task<List<Room>> GetAvailableRoomsAsync(AvailableRoomsQueryDto query)
    {
        var occupiedRoomIds = await _context.CourseClasses
            .Where(cc =>
                cc.IsActive &&
                !cc.IsDeleted &&
                cc.DayOfWeek == query.DayOfWeek &&
                cc.DateStart <= query.DateEnd &&
                cc.DateEnd >= query.DateStart &&
                cc.StartPeriod < query.EndPeriod &&
                cc.EndPeriod > query.StartPeriod)
            .Select(cc => cc.RoomId)
            .Distinct()
            .ToListAsync();

        var roomQuery = _context.Rooms
            .Include(r => r.Building)
            .Where(r =>
                r.IsActive &&
                !r.IsDeleted &&
                r.RoomStatus == "active" &&
                !occupiedRoomIds.Contains(r.RoomId));

        if (query.MinCapacity.HasValue)
            roomQuery = roomQuery.Where(r => r.Capacity >= query.MinCapacity.Value);

        return await roomQuery
            .OrderBy(r => r.Building.BuildingName)
            .ThenBy(r => r.RoomCode)
            .ToListAsync();
    }

    public async Task<int> GetCurrentEnrollmentCountAsync(Guid courseClassId)
    {
        return await _context.StudentEnrollments
            .CountAsync(e =>
                e.CourseClassId == courseClassId &&
                e.EnrollmentStatus == "registered" &&
                e.IsActive &&
                !e.IsDeleted);
    }

    public async Task<bool> HasEnrollmentsAsync(Guid courseClassId)
    {
        return await _context.StudentEnrollments
            .AnyAsync(e =>
                e.CourseClassId == courseClassId &&
                e.EnrollmentStatus == "registered" &&
                e.IsActive &&
                !e.IsDeleted);
    }

    /// <summary>
    /// Get all available time slots for rooms within a date range
    /// </summary>
    public async Task<List<AvailableRoomSlotDto>> GetAvailableTimeSlotsAsync(AvailableSlotQueryDto query)
    {
        // Step 1: Get all active rooms that match the criteria
        var roomsQuery = _context.Rooms
            .Include(r => r.Building)
            .Where(r => r.IsActive && !r.IsDeleted && r.RoomStatus == "active");

        if (query.MinCapacity.HasValue)
            roomsQuery = roomsQuery.Where(r => r.Capacity >= query.MinCapacity.Value);

        if (!string.IsNullOrEmpty(query.RoomType))
            roomsQuery = roomsQuery.Where(r => r.RoomType == query.RoomType);

        if (query.BuildingId.HasValue)
            roomsQuery = roomsQuery.Where(r => r.BuildingId == query.BuildingId.Value);

        var rooms = await roomsQuery.ToListAsync();

        // Step 2: Get all occupied time slots within the date range
        var occupiedSlots = await _context.CourseClasses
            .Where(cc =>
                cc.IsActive &&
                !cc.IsDeleted &&
                cc.DateStart <= query.DateEnd &&
                cc.DateEnd >= query.DateStart)
            .Select(cc => new
            {
                cc.RoomId,
                cc.DayOfWeek,
                cc.StartPeriod,
                cc.EndPeriod
            })
            .ToListAsync();

        // Step 3: Get exam schedule conflicts
        var startDateTime = query.DateStart.ToDateTime(TimeOnly.MinValue);
        var endDateTime = query.DateEnd.ToDateTime(TimeOnly.MaxValue);

        var examSlots = await _context.ExamClasses
            .Where(ec =>
                ec.IsActive &&
                !ec.IsDeleted &&
                ec.StartTime >= startDateTime &&
                ec.StartTime <= endDateTime)
            .Select(ec => new
            {
                ec.RoomId,
                ec.StartTime,
                ec.DurationMinutes
            })
            .ToListAsync();

        // Step 4: Get schedule change conflicts
        var scheduleChangeSlots = await _context.ScheduleChanges
            .Where(sc =>
                sc.IsActive &&
                !sc.IsDeleted &&
                sc.MakeupDate.HasValue &&
                sc.MakeupDate.Value >= query.DateStart &&
                sc.MakeupDate.Value <= query.DateEnd &&
                sc.MakeupRoomId.HasValue)
            .Select(sc => new
            {
                RoomId = sc.MakeupRoomId.Value,
                sc.DayOfWeek,
                sc.StartPeriod,
                sc.EndPeriod
            })
            .ToListAsync();

        // Step 5: Get room booking conflicts
        var roomBookingSlots = await _context.RoomBookings
            .Where(rb =>
                rb.IsActive &&
                !rb.IsDeleted &&
                (rb.BookingStatus == "confirmed" || rb.BookingStatus == "pending") &&
                rb.BookingDate >= query.DateStart &&
                rb.BookingDate <= query.DateEnd)
            .Select(rb => new
            {
                rb.RoomId,
                rb.BookingDate,
                rb.StartTime,
                rb.EndTime
            })
            .ToListAsync();

        // Step 6: Build available slots for each room
        var result = new List<AvailableRoomSlotDto>();

        foreach (var room in rooms)
        {
            var roomSlot = new AvailableRoomSlotDto
            {
                RoomId = room.RoomId,
                RoomCode = room.RoomCode ?? "N/A",
                RoomName = room.RoomName ?? "N/A",
                Capacity = room.Capacity,
                RoomType = room.RoomType ?? "N/A",
                BuildingName = room.Building?.BuildingName ?? "N/A",
                BuildingId = room.BuildingId,
                AvailableTimeSlots = new List<TimeSlotDto>()
            };

            // Check each day of week (2=Monday to 8=Sunday)
            for (int dayOfWeek = 2; dayOfWeek <= 8; dayOfWeek++)
            {
                // Check common time slot patterns (morning, afternoon, evening)
                var timeSlotPatterns = new List<(int start, int end)>
                {
                    (1, 5),   // Morning late
                    (6, 9),   // Afternoon early
                    (10, 12), // Afternoon late
                };

                foreach (var (startPeriod, endPeriod) in timeSlotPatterns)
                {
                    bool isAvailable = true;
                    string? conflictReason = null;

                    // Check against course class occupancy
                    var hasClassConflict = occupiedSlots.Any(occ =>
                        occ.RoomId == room.RoomId &&
                        occ.DayOfWeek == dayOfWeek &&
                        occ.StartPeriod < endPeriod &&
                        occ.EndPeriod > startPeriod);

                    if (hasClassConflict)
                    {
                        isAvailable = false;
                        conflictReason = "Có lớp học phần khác";
                    }

                    // Check against schedule changes
                    var hasScheduleChangeConflict = scheduleChangeSlots.Any(sc =>
                        sc.RoomId == room.RoomId &&
                        sc.DayOfWeek == dayOfWeek &&
                        sc.StartPeriod < endPeriod &&
                        sc.EndPeriod > startPeriod);

                    if (hasScheduleChangeConflict)
                    {
                        isAvailable = false;
                        conflictReason = "Có lịch học bù";
                    }

                    // Check against exams (convert day of week)
                    var hasExamConflict = examSlots.Any(exam =>
                    {
                        var examRoomId = exam.RoomId;
                        var examDayOfWeek = ConvertDayOfWeekFromDateTime(exam.StartTime);
                        return examRoomId == room.RoomId && examDayOfWeek == dayOfWeek;
                    });

                    if (hasExamConflict)
                    {
                        isAvailable = false;
                        conflictReason = "Có lịch thi";
                    }

                    // Check against room bookings (simplified check)
                    var hasBookingConflict = roomBookingSlots.Any(rb =>
                        rb.RoomId == room.RoomId &&
                        ConvertDayOfWeekFromDateOnly(rb.BookingDate) == dayOfWeek);

                    if (hasBookingConflict)
                    {
                        isAvailable = false;
                        conflictReason = "Phòng đã được đặt";
                    }

                    roomSlot.AvailableTimeSlots.Add(new TimeSlotDto
                    {
                        DayOfWeek = dayOfWeek,
                        DayOfWeekName = GetDayOfWeekName(dayOfWeek),
                        StartPeriod = startPeriod,
                        EndPeriod = endPeriod,
                        PeriodRange = $"Tiết {startPeriod}-{endPeriod}",
                        IsAvailable = isAvailable,
                        ConflictReason = conflictReason
                    });
                }
            }

            // Only add rooms that have at least one available slot
            if (roomSlot.AvailableTimeSlots.Any(ts => ts.IsAvailable))
            {
                result.Add(roomSlot);
            }
        }

        return result;
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

    private int ConvertDayOfWeekFromDateTime(DateTime dateTime)
    {
        // DayOfWeek: Sunday=0, Monday=1, ..., Saturday=6
        // Our system: Monday=2, ..., Sunday=8
        var dotNetDayOfWeek = (int)dateTime.DayOfWeek;
        return dotNetDayOfWeek == 0 ? 8 : dotNetDayOfWeek + 1;
    }

    private int ConvertDayOfWeekFromDateOnly(DateOnly date)
    {
        var dotNetDayOfWeek = (int)date.DayOfWeek;
        return dotNetDayOfWeek == 0 ? 8 : dotNetDayOfWeek + 1;
    }

    /// <summary>
    /// Get all available instructors who are free to teach at the specified time
    /// </summary>
    public async Task<List<AvailableInstructorDto>> GetAvailableInstructorsAsync(AvailableInstructorsQueryDto query)
    {
        // Step 1: Get period range details
        var (startPeriod, endPeriod, _) = PeriodRangeHelper.GetPeriodRange(query.PeriodRange);
        
        // Step 2: Get the faculty ID through subject's department
        var facultyId = await _context.Subjects
            .Where(s => s.SubjectId == query.SubjectId)
            .Select(s => s.Department.FacultyId)
            .FirstOrDefaultAsync();
        
        if (facultyId == Guid.Empty)
        {
            throw new InvalidOperationException("Không tìm thấy thông tin khoa của môn học");
        }
        
        // Step 3: Get semester info for further filtering
        var semester = await _context.Semesters
            .FirstOrDefaultAsync(s => s.SemesterId == query.SemesterId);
        if (semester == null)
        {
            throw new InvalidOperationException("Không tìm thấy thông tin học kỳ");
        }
        
        // Step 4: Get all instructors in the same faculty
        var instructorsInFaculty = await _context.Instructors
            .Include(i => i.Person)
            .Where(i => 
                i.IsActive && 
                !i.IsDeleted && 
                i.FacultyId == facultyId)
            .ToListAsync();
        
        // Step 5: Get all occupied instructor IDs during the specified time
        var occupiedInstructorQuery = _context.CourseClasses
            .Where(cc =>
                cc.IsActive &&
                !cc.IsDeleted &&
                cc.InstructorId.HasValue &&
                cc.Course.SemesterId == query.SemesterId &&
                cc.DayOfWeek == query.DayOfWeek &&
                cc.StartPeriod < endPeriod &&
                cc.EndPeriod > startPeriod);
        
        // Exclude the current course class if specified (for updating existing course class)
        if (query.ExcludeCourseClassId.HasValue)
        {
            occupiedInstructorQuery = occupiedInstructorQuery.Where(cc => cc.CourseClassId != query.ExcludeCourseClassId.Value);
        }
        
        var occupiedInstructorIds = await occupiedInstructorQuery
            .Select(cc => cc.InstructorId!.Value)
            .Distinct()
            .ToListAsync();
        
        // Step 6: Check exam schedule conflicts for instructors
        // Assuming ExamClass has Instructor navigation or we check through CourseClass
        var instructorsWithExamConflict = await _context.ExamClasses
            .Include(ec => ec.CourseClass)
            .Where(ec =>
                ec.IsActive &&
                !ec.IsDeleted &&
                ec.CourseClass != null &&
                ec.CourseClass.InstructorId.HasValue &&
                ec.CourseClass.Course.SemesterId == query.SemesterId &&
                (query.DayOfWeek == 8 ?
                    EF.Functions.DateDiffDay(DateTime.MinValue, ec.StartTime) % 7 == 0 :
                    EF.Functions.DateDiffDay(DateTime.MinValue, ec.StartTime) % 7 == (query.DayOfWeek - 1) % 7))
            .Select(ec => ec.CourseClass.InstructorId!.Value)
            .Distinct()
            .ToListAsync();
        
        // Step 7: Combine all occupied instructors
        var allOccupiedInstructorIds = occupiedInstructorIds
            .Union(instructorsWithExamConflict)
            .ToHashSet();
        
        // Step 8: Filter available instructors
        var availableInstructors = instructorsInFaculty
            .Where(i => !allOccupiedInstructorIds.Contains(i.InstructorId))
            .ToList();
        
        // Step 9: Get teaching statistics for available instructors
        // Note: We keep this query fully translatable by avoiding DateOnly.ToDateTime/DateDiffDay
        // and approximate total teaching load as total periods taught.
        var instructorIds = availableInstructors.Select(i => i.InstructorId).ToList();
        
        var teachingStats = await _context.CourseClasses
            .Where(cc =>
                cc.IsActive &&
                !cc.IsDeleted &&
                cc.InstructorId.HasValue &&
                instructorIds.Contains(cc.InstructorId.Value) &&
                cc.Course.SemesterId == query.SemesterId)
            .GroupBy(cc => cc.InstructorId!.Value)
            .Select(g => new
            {
                InstructorId = g.Key,
                ClassCount = g.Count(),
                TotalHours = g.Sum(cc => cc.EndPeriod - cc.StartPeriod)
            })
            .ToDictionaryAsync(x => x.InstructorId);
        
        // Step 10: Map to DTOs
        var result = availableInstructors.Select(instructor =>
        {
            var instructorCourseClasses = _context.CourseClasses
                .Where(cc => cc.InstructorId == instructor.InstructorId && cc.Course.SemesterId == query.SemesterId)
                .Select(cc => new AvailableInstructorCourseClassDto
                {
                    SubjectName = cc.Course.Subject.SubjectName,
                    CourseClassId = cc.CourseClassId,
                    CourseClassCode = cc.CourseClassCode,
                    DayOfWeek = PeriodRangeHelper.GetDayOfWeekName(cc.DayOfWeek),
                    TimePeriod = $"Tiết {cc.StartPeriod}-{cc.EndPeriod}"
                })
                .ToList();

            return new AvailableInstructorDto
            {
                InstructorId = instructor.InstructorId,
                InstructorCode = instructor.InstructorCode ?? "N/A",
                FullName = instructor.Person?.FullName ?? "N/A",
                Email = instructor.Person?.Email ?? "N/A",
                PhoneNumber = instructor.Person?.PhoneNumber ?? "N/A",
                CourseClasses = instructorCourseClasses
            };
        })
        .OrderBy(i => i.FullName)
        .ToList();
        
        return result;
    }
    
    /// <summary>
    /// Get all course classes with advanced search and filtering
    /// </summary>
    public async Task<List<CourseClass>> GetAllWithAdvancedFilterAsync(CourseClassAdvancedFilterDto filter)
    {
        var query = _context.CourseClasses
            .Include(cc => cc.Course)
                .ThenInclude(c => c.Subject)
            .Include(cc => cc.Course)
                .ThenInclude(c => c.Semester)
            .Include(cc => cc.Instructor)
                .ThenInclude(i => i!.Person)
            .Include(cc => cc.StudentEnrollments.Where(e => e.EnrollmentStatus == "registered"))
            .Where(cc => cc.IsActive && !cc.IsDeleted);

        // Search
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var searchLower = filter.SearchTerm.ToLower();
            query = query.Where(cc =>
                cc.CourseClassCode.ToLower().Contains(searchLower) ||
                cc.Course.Subject.SubjectName.ToLower().Contains(searchLower) ||
                (cc.Instructor != null && cc.Instructor.Person.FullName.ToLower().Contains(searchLower))
            );
        }

        // Filters
        if (filter.SubjectId.HasValue)
            query = query.Where(cc => cc.Course.SubjectId == filter.SubjectId.Value);

        if (filter.InstructorId.HasValue)
            query = query.Where(cc => cc.InstructorId == filter.InstructorId.Value);

        if (filter.SemesterId.HasValue)
            query = query.Where(cc => cc.Course.SemesterId == filter.SemesterId.Value);

        if (!string.IsNullOrEmpty(filter.CourseClassStatus))
            query = query.Where(cc => cc.CourseClassStatus == filter.CourseClassStatus);

        // Sorting
        query = filter.SortBy?.ToLower() switch
        {
            "subject_name" => filter.SortOrder == "desc" 
                ? query.OrderByDescending(cc => cc.Course.Subject.SubjectName)
                : query.OrderBy(cc => cc.Course.Subject.SubjectName),
            "students_enrolled" => filter.SortOrder == "desc"
                ? query.OrderByDescending(cc => cc.StudentEnrollments.Count(e => e.EnrollmentStatus == "registered"))
                : query.OrderBy(cc => cc.StudentEnrollments.Count(e => e.EnrollmentStatus == "registered")),
            "semester_name" => filter.SortOrder == "desc"
                ? query.OrderByDescending(cc => cc.Course.Semester.SemesterName)
                : query.OrderBy(cc => cc.Course.Semester.SemesterName),
            _ => filter.SortOrder == "desc"
                ? query.OrderByDescending(cc => cc.CourseClassCode)
                : query.OrderBy(cc => cc.CourseClassCode)
        };

        return await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountWithAdvancedFilterAsync(CourseClassAdvancedFilterDto filter)
    {
        var query = _context.CourseClasses
            .Include(cc => cc.Course)
                .ThenInclude(c => c.Subject)
            .Include(cc => cc.Instructor)
                .ThenInclude(i => i!.Person)
            .Where(cc => cc.IsActive && !cc.IsDeleted);

        // Search
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var searchLower = filter.SearchTerm.ToLower();
            query = query.Where(cc =>
                cc.CourseClassCode.ToLower().Contains(searchLower) ||
                cc.Course.Subject.SubjectName.ToLower().Contains(searchLower) ||
                (cc.Instructor != null && cc.Instructor.Person.FullName.ToLower().Contains(searchLower))
            );
        }

        // Filters
        if (filter.SubjectId.HasValue)
            query = query.Where(cc => cc.Course.SubjectId == filter.SubjectId.Value);

        if (filter.InstructorId.HasValue)
            query = query.Where(cc => cc.InstructorId == filter.InstructorId.Value);

        if (filter.SemesterId.HasValue)
            query = query.Where(cc => cc.Course.SemesterId == filter.SemesterId.Value);

        if (!string.IsNullOrEmpty(filter.CourseClassStatus))
            query = query.Where(cc => cc.CourseClassStatus == filter.CourseClassStatus);

        return await query.CountAsync();
    }
}