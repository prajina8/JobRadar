import React, { useState } from "react";

function TagInput({ label, values = [], onChange, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  function addTag(raw) {
    const tag = raw.trim();
    if (!tag || values.includes(tag)) {
      setInputValue("");
      return;
    }
    onChange([...values, tag]);
    setInputValue("");
  }

  function removeTag(index) {
    onChange(values.filter((_, i) => i !== index));
  }

  function handleKeyDown(e) {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
      return;
    }
    if (e.key === "Backspace" && !inputValue && values.length) {
      removeTag(values.length - 1);
    }
  }

  function handleChange(e) {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      const last = parts.pop();
      parts.forEach((p) => addTag(p));
      setInputValue(last);
      return;
    }
    setInputValue(val);
  }

  function handleBlur() {
    if (inputValue.trim()) addTag(inputValue);
  }

  return (
    <div className="tag-input">
      {label && <span className="tag-input-label">{label}</span>}
      <div className="tag-input-box">
        {values.map((tag, i) => (
          <span className="tag-chip" key={`${tag}-${i}`}>
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => removeTag(i)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={values.length ? "" : placeholder}
        />
      </div>
    </div>
  );
}

export default TagInput;