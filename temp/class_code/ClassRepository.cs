using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduManagement.Core.Application.DTOs.Class;
using EduManagement.Core.Application.Interfaces.Repositories;
using EduManagement.Core.Domain.Entities;
using EduManagement.Infrastructure.Data;

namespace EduManagement.Infrastructure.Repositories;

public class ClassRepository : IClassRepository
{
    private readonly EduManagementContext _context;

    public ClassRepository(EduManagementContext context)
    {
        _context = context;
    }

    public async Task<Class?> GetByIdAsync(Guid id)
    {
        return await _context.Classes
            .Where(c => c.ClassId == id && c.IsActive && !c.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<Class?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Classes
            .Include(c => c.Department)
                .ThenInclude(d => d.Faculty)
            .Include(c => c.AdvisorInstructor)
                .ThenInclude(i => i!.Person)
            .Include(c => c.TrainingSystem)
            .Include(c => c.StartAcademicYear)
            .Include(c => c.EndAcademicYear)
            .Include(c => c.Curriculum)
            .Include(c => c.Students.Where(s => s.IsActive && !s.IsDeleted))
                .ThenInclude(s => s.Person)
            .Where(c => c.ClassId == id && c.IsActive && !c.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Class>> GetAllWithDetailsAsync(ClassFilterDto filter)
    {
        var query = _context.Classes
            .Include(c => c.Department)
                .ThenInclude(d => d.Faculty)
            .Include(c => c.AdvisorInstructor)
                .ThenInclude(i => i!.Person)
            .Include(c => c.TrainingSystem)
            .Include(c => c.StartAcademicYear)
            .Include(c => c.EndAcademicYear)
            .Include(c => c.Curriculum)
            .Include(c => c.Students.Where(s => s.IsActive && !s.IsDeleted))
            .Where(c => c.IsActive && !c.IsDeleted);

        if (filter.DepartmentId.HasValue)
            query = query.Where(c => c.DepartmentId == filter.DepartmentId.Value);

        if (filter.TrainingSystemId.HasValue)
            query = query.Where(c => c.TrainingSystemId == filter.TrainingSystemId.Value);

        if (filter.AdvisorInstructorId.HasValue)
            query = query.Where(c => c.AdvisorInstructorId == filter.AdvisorInstructorId.Value);

        if (filter.StartAcademicYearId.HasValue)
            query = query.Where(c => c.StartAcademicYearId == filter.StartAcademicYearId.Value);

        if (filter.EndAcademicYearId.HasValue)
            query = query.Where(c => c.EndAcademicYearId == filter.EndAcademicYearId.Value);

        if (!string.IsNullOrEmpty(filter.ClassStatus))
            query = query.Where(c => c.ClassStatus == filter.ClassStatus);

        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            var searchTerm = filter.SearchTerm.ToLower();
            query = query.Where(c =>
                c.ClassCode.ToLower().Contains(searchTerm) ||
                c.ClassName.ToLower().Contains(searchTerm) ||
                (c.Department != null && (c.Department.DepartmentCode.ToLower().Contains(searchTerm) ||
                c.Department.DepartmentName.ToLower().Contains(searchTerm))) ||
                (c.Department != null && c.Department.Faculty != null && (c.Department.Faculty.FacultyCode.ToLower().Contains(searchTerm) ||
                c.Department.Faculty.FacultyName.ToLower().Contains(searchTerm))) ||
                (c.AdvisorInstructor != null && c.AdvisorInstructor.Person != null && c.AdvisorInstructor.Person.FullName.ToLower().Contains(searchTerm)) ||
                (c.TrainingSystem != null && c.TrainingSystem.TrainingSystemName.ToLower().Contains(searchTerm)));
        }

        return await query
            .OrderBy(c => c.ClassCode)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync(ClassFilterDto filter)
    {
        var query = _context.Classes
            .Include(c => c.Department)
                .ThenInclude(d => d.Faculty)
            .Include(c => c.AdvisorInstructor)
                .ThenInclude(i => i!.Person)
            .Include(c => c.TrainingSystem)
            .Where(c => c.IsActive && !c.IsDeleted);

        if (filter.DepartmentId.HasValue)
            query = query.Where(c => c.DepartmentId == filter.DepartmentId.Value);

        if (filter.TrainingSystemId.HasValue)
            query = query.Where(c => c.TrainingSystemId == filter.TrainingSystemId.Value);

        if (filter.AdvisorInstructorId.HasValue)
            query = query.Where(c => c.AdvisorInstructorId == filter.AdvisorInstructorId.Value);

        if (filter.StartAcademicYearId.HasValue)
            query = query.Where(c => c.StartAcademicYearId == filter.StartAcademicYearId.Value);

        if (filter.EndAcademicYearId.HasValue)
            query = query.Where(c => c.EndAcademicYearId == filter.EndAcademicYearId.Value);

        if (!string.IsNullOrEmpty(filter.ClassStatus))
            query = query.Where(c => c.ClassStatus == filter.ClassStatus);

        if (!string.IsNullOrEmpty(filter.SearchTerm))
        {
            var searchTerm = filter.SearchTerm.ToLower();
            query = query.Where(c =>
                c.ClassCode.ToLower().Contains(searchTerm) ||
                c.ClassName.ToLower().Contains(searchTerm) ||
                (c.Department != null && (c.Department.DepartmentCode.ToLower().Contains(searchTerm) ||
                c.Department.DepartmentName.ToLower().Contains(searchTerm))) ||
                (c.Department != null && c.Department.Faculty != null && (c.Department.Faculty.FacultyCode.ToLower().Contains(searchTerm) ||
                c.Department.Faculty.FacultyName.ToLower().Contains(searchTerm))) ||
                (c.AdvisorInstructor != null && c.AdvisorInstructor.Person != null && c.AdvisorInstructor.Person.FullName.ToLower().Contains(searchTerm)) ||
                (c.TrainingSystem != null && c.TrainingSystem.TrainingSystemName.ToLower().Contains(searchTerm)));
        }

        return await query.CountAsync();
    }

    public async Task<Class> CreateAsync(Class classEntity)
    {
        classEntity.ClassId = Guid.NewGuid();
        classEntity.CreatedAt = DateTime.UtcNow;
        classEntity.IsActive = true;
        classEntity.IsDeleted = false;
        classEntity.ClassStatus = "active";

        _context.Classes.Add(classEntity);
        await _context.SaveChangesAsync();
        return classEntity;
    }

    public async Task<Class> UpdateAsync(Class classEntity)
    {
        classEntity.UpdatedAt = DateTime.UtcNow;
        _context.Classes.Update(classEntity);
        await _context.SaveChangesAsync();
        return classEntity;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var classEntity = await GetByIdAsync(id);
        if (classEntity == null) return false;

        classEntity.IsActive = false;
        classEntity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsClassCodeUniqueAsync(string classCode, Guid? excludeClassId = null)
    {
        var query = _context.Classes.Where(c => c.ClassCode == classCode && !c.IsDeleted);

        if (excludeClassId.HasValue)
            query = query.Where(c => c.ClassId != excludeClassId.Value);

        return !await query.AnyAsync();
    }

    public async Task<bool> HasActiveStudentsAsync(Guid classId)
    {
        return await _context.Students
            .AnyAsync(s =>
                s.ClassId == classId &&
                s.IsActive &&
                !s.IsDeleted &&
                s.EnrollmentStatus == "active");
    }

    public async Task<bool> IsAdvisorFromSameDepartmentAsync(Guid advisorId, Guid departmentId)
    {
        var department = await _context.Departments
            .Where(d => d.DepartmentId == departmentId && d.IsActive && !d.IsDeleted)
            .FirstOrDefaultAsync();

        if (department == null) return false;

        return await _context.Instructors
            .AnyAsync(i =>
                i.InstructorId == advisorId &&
                i.FacultyId == department.FacultyId &&
                i.IsActive &&
                !i.IsDeleted);
    }

    public async Task<bool> IsCurriculumFromSameDepartmentAsync(Guid curriculumId, Guid departmentId)
    {
        return await _context.Curricula
            .AnyAsync(c =>
                c.CurriculumId == curriculumId &&
                c.DepartmentId == departmentId &&
                c.IsActive &&
                !c.IsDeleted);
    }

    public async Task<int> GetStudentCountAsync(Guid classId)
    {
        return await _context.Students
            .CountAsync(s =>
                s.ClassId == classId &&
                s.IsActive &&
                !s.IsDeleted);
    }

    public async Task<List<InstructorBasicDto>> GetAvailableInstructorsByDepartmentIdAsync(Guid departmentId)
    {
        var department = await _context.Departments
            .Where(d => d.DepartmentId == departmentId && d.IsActive && !d.IsDeleted)
            .FirstOrDefaultAsync();

        if (department == null) return new List<InstructorBasicDto>();

        return await _context.Instructors
            .Include(i => i.Person)
            .Where(i => i.FacultyId == department.FacultyId && i.IsActive && !i.IsDeleted)
            .Select(i => new InstructorBasicDto
            {
                InstructorId = i.InstructorId,
                FullName = i.Person.FullName
            })
            .ToListAsync();
    }

    public async Task<List<CurriculumBasicDto>> GetAvailableCurriculumsByDepartmentIdAsync(Guid departmentId)
    {
        return await _context.Curricula
            .Where(c => c.DepartmentId == departmentId && c.IsActive && !c.IsDeleted)
            .Select(c => new CurriculumBasicDto
            {
                CurriculumId = c.CurriculumId,
                CurriculumName = c.CurriculumName
            })
            .ToListAsync();
    }

    public async Task<Guid> GetOrCreateEndAcademicYearAsync(Guid startAcademicYearId)
    {
        var startYear = await _context.AcademicYears
            .Where(y => y.AcademicYearId == startAcademicYearId)
            .FirstOrDefaultAsync();

        if (startYear == null) throw new InvalidOperationException("Năm học bắt đầu không tồn tại");

        var startYearValue = int.Parse(startYear.YearName.Split('-')[0]);
        var endYearValue = startYearValue + 4;
        var endYearName = $"{endYearValue}-{endYearValue + 1}";

        var endYear = await _context.AcademicYears
            .Where(y => y.YearName == endYearName)
            .FirstOrDefaultAsync();

        if (endYear == null)
        {
            endYear = new AcademicYear
            {
                AcademicYearId = Guid.NewGuid(),
                YearName = endYearName,
                StartDate = DateOnly.FromDateTime(new DateTime(endYearValue, 9, 1)),
                EndDate = DateOnly.FromDateTime(new DateTime(endYearValue + 1, 8, 31)),
                AcademicYearStatus = "active",
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsDeleted = false
            };
            _context.AcademicYears.Add(endYear);
            await _context.SaveChangesAsync();
        }

        return endYear.AcademicYearId;
    }

    public async Task<bool> TrainingSystemExistsAsync(Guid trainingSystemId)
    {
        return await _context.TrainingSystems
            .AnyAsync(ts => ts.TrainingSystemId == trainingSystemId && ts.IsActive && !ts.IsDeleted);
    }

    public async Task<List<EduManagement.Core.Application.DTOs.Class.TrainingSystemBasicDto>> GetAvailableTrainingSystemsAsync()
    {
        return await _context.TrainingSystems
            .Where(ts => ts.IsActive && !ts.IsDeleted)
            .Select(ts => new EduManagement.Core.Application.DTOs.Class.TrainingSystemBasicDto
            {
                TrainingSystemId = ts.TrainingSystemId,
                TrainingSystemName = ts.TrainingSystemName
            })
            .OrderBy(ts => ts.TrainingSystemName)
            .ToListAsync();
    }
}
