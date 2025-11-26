package com.financetracker.security;

import com.financetracker.repository.RevokedTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtTokenProvider tokenProvider;
    private final RevokedTokenRepository revokedTokenRepository;
    
    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, 
                                   RevokedTokenRepository revokedTokenRepository) {
        this.tokenProvider = tokenProvider;
        this.revokedTokenRepository = revokedTokenRepository;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // Check if token is revoked
                String tokenHash = tokenProvider.hashToken(jwt);
                if (revokedTokenRepository.existsByTokenHash(tokenHash)) {
                    logger.debug("Token is revoked");
                } else {
                    Long userId = tokenProvider.getUserIdFromToken(jwt);
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    
                    UserPrincipal userPrincipal = new UserPrincipal(
                            userId,
                            username,
                            null,
                            true,
                            true,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    userPrincipal, null, userPrincipal.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        // First, try to get from HttpOnly cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (tokenProvider.getCookieName().equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        // Fallback: get from Authorization header (for API clients)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}
