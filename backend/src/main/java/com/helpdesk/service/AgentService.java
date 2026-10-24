
package com.helpdesk.service;

import com.helpdesk.dto.admin.AgentResponse;
import com.helpdesk.dto.admin.CreateAgentRequest;
import com.helpdesk.entity.User;
import com.helpdesk.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class AgentService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AgentService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AgentResponse createAgent(CreateAgentRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        User agent = new User();

        agent.setFullName(request.getFullName().trim());
        agent.setEmail(email);
        agent.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        agent.setRole(User.Role.AGENT);
        agent.setEnabled(true);

        User savedAgent = userRepository.save(agent);

        return toResponse(savedAgent);
    }

    @Transactional(readOnly = true)
    public List<AgentResponse> getAllAgents() {

        return userRepository.findByRole(User.Role.AGENT)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgentResponse> getEnabledAgents() {

        return userRepository.findByRoleAndEnabledTrue(
                        User.Role.AGENT
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AgentResponse getAgentById(Long agentId) {

        User agent = findAgent(agentId);

        return toResponse(agent);
    }

    @Transactional
    public AgentResponse disableAgent(Long agentId) {

        User agent = findAgent(agentId);

        agent.setEnabled(false);

        return toResponse(userRepository.save(agent));
    }

    @Transactional
    public AgentResponse enableAgent(Long agentId) {

        User agent = findAgent(agentId);

        agent.setEnabled(true);

        return toResponse(userRepository.save(agent));
    }

    @Transactional(readOnly = true)
    public User getEnabledAgentEntity(Long agentId) {

        User agent = findAgent(agentId);

        if (!Boolean.TRUE.equals(agent.getEnabled())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected agent is disabled"
            );
        }

        return agent;
    }

    private User findAgent(Long agentId) {

        User user = userRepository.findById(agentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Agent not found"
                ));

        if (user.getRole() != User.Role.AGENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected user is not an agent"
            );
        }

        return user;
    }


    private AgentResponse toResponse(User agent) {

        return new AgentResponse(
                agent.getId(),
                agent.getFullName(),
                agent.getEmail(),
                agent.getRole().name(),
                agent.getEnabled(),
                agent.getCreatedAt()
        );
    }
}
