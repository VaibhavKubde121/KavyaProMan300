package com.team1.backend.dto;

public class VerifyOtpRequest {
    private Long userId;
    private String code;

    public VerifyOtpRequest() {}

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
