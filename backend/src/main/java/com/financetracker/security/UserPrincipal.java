package com.financetracker.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Custom UserDetails implementation that includes the user ID.
 */
public class UserPrincipal implements UserDetails {
    
    private static final long serialVersionUID = 1L;
    
    private final Long id;
    private final String username;
    private final String password;
    private final boolean enabled;
    private final boolean accountNonLocked;
    private final Collection<? extends GrantedAuthority> authorities;
    
    public UserPrincipal(Long id, String username, String password, boolean enabled,
                         boolean accountNonLocked, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.enabled = enabled;
        this.accountNonLocked = accountNonLocked;
        this.authorities = authorities;
    }
    
    public Long getId() {
        return id;
    }
    
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
