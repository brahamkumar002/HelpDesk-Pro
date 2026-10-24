
package com.helpdesk.controller;

import com.helpdesk.dto.category.CategoryRequest;
import com.helpdesk.dto.category.CategoryResponse;
import com.helpdesk.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // All authenticated users: View enabled categories
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getEnabledCategories() {

        return ResponseEntity.ok(
                categoryService.getEnabledCategories()
        );
    }

    // ADMIN: View all categories, including disabled ones
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {

        return ResponseEntity.ok(
                categoryService.getAllCategories()
        );
    }

    // ADMIN: View category details
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                categoryService.getCategoryById(id)
        );
    }

    // ADMIN: Create category
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(categoryService.createCategory(request));
    }

    // ADMIN: Update category
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(
                categoryService.updateCategory(id, request)
        );
    }

    // ADMIN: Disable category
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/disable")
    public ResponseEntity<CategoryResponse> disableCategory(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                categoryService.disableCategory(id)
        );
    }

    // ADMIN: Enable category
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/enable")
    public ResponseEntity<CategoryResponse> enableCategory(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                categoryService.enableCategory(id)
        );
    }
}
