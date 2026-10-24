
package com.helpdesk.service;

import com.helpdesk.dto.category.CategoryRequest;
import com.helpdesk.dto.category.CategoryResponse;
import com.helpdesk.entity.Category;
import com.helpdesk.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {

        String name = request.getName().trim();

        validateUniqueName(name, null);

        Category category = new Category();
        category.setName(name);
        category.setDescription(request.getDescription());
        category.setEnabled(true);

        Category savedCategory = categoryRepository.save(category);

        return toResponse(savedCategory);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getEnabledCategories() {

        return categoryRepository.findByEnabledTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {

        Category category = findCategory(id);

        return toResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request
    ) {

        Category category = findCategory(id);

        String name = request.getName().trim();

        validateUniqueName(name, id);

        category.setName(name);
        category.setDescription(request.getDescription());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse disableCategory(Long id) {

        Category category = findCategory(id);

        category.setEnabled(false);

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse enableCategory(Long id) {

        Category category = findCategory(id);

        category.setEnabled(true);

        return toResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public Category getEnabledCategoryEntity(Long id) {

        Category category = findCategory(id);

        if (!Boolean.TRUE.equals(category.getEnabled())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected category is disabled"
            );
        }

        return category;
    }

    private Category findCategory(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"
                ));
    }

    private void validateUniqueName(String name, Long excludeId) {

        boolean duplicate = categoryRepository.findAll()
                .stream()
                .anyMatch(category ->
                        category.getName().toLowerCase(Locale.ROOT)
                                .equals(name.toLowerCase(Locale.ROOT))
                                && !category.getId().equals(excludeId)
                );

        if (duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category name already exists"
            );
        }
    }

    private CategoryResponse toResponse(Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getEnabled(),
                category.getCreatedAt()
        );
    }
}
