// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE.chromium file.

#include "native_mate/wrappable.h"

#include "base/logging.h"
#include "native_mate/dictionary.h"
#include "native_mate/object_template_builder.h"

namespace mate {

WrappableBase::WrappableBase() = default;

WrappableBase::~WrappableBase() {
  if (wrapper_.IsEmpty())
    return;

  GetWrapper()->SetAlignedPointerInInternalField(0, nullptr);
  wrapper_.ClearWeak();
  wrapper_.Reset();
}

v8::Local<v8::Object> WrappableBase::GetWrapper() const {
  if (!wrapper_.IsEmpty())
    return v8::Local<v8::Object>::New(isolate_, wrapper_);
  else
    return v8::Local<v8::Object>();
}

v8::MaybeLocal<v8::Object> WrappableBase::GetWrapper(
    v8::Isolate* isolate) const {
  if (!wrapper_.IsEmpty())
    return v8::MaybeLocal<v8::Object>(
        v8::Local<v8::Object>::New(isolate, wrapper_));
  else
    return v8::MaybeLocal<v8::Object>();
}

void WrappableBase::InitWith(v8::Isolate* isolate,
                             v8::Local<v8::Object> wrapper) {
  CHECK(wrapper_.IsEmpty());
  isolate_ = isolate;
  wrapper->SetAlignedPointerInInternalField(0, this);
  wrapper_.Reset(isolate, wrapper);
  wrapper_.SetWeak(this, FirstWeakCallback, v8::WeakCallbackType::kParameter);

  // Call object._init if we have one.
  v8::Local<v8::Function> init;
  if (Dictionary(isolate, wrapper).Get("_init", &init))
    init->Call(isolate->GetCurrentContext(), wrapper, 0, nullptr).IsEmpty();

  AfterInit(isolate);
}

// static
void WrappableBase::FirstWeakCallback(
    const v8::WeakCallbackInfo<WrappableBase>& data) {
  WrappableBase* wrappable = data.GetParameter();
  wrappable->wrapper_.Reset();
  data.SetSecondPassCallback(SecondWeakCallback);
}

// static
void WrappableBase::SecondWeakCallback(
    const v8::WeakCallbackInfo<WrappableBase>& data) {
  WrappableBase* wrappable = data.GetParameter();
  delete wrappable;
}

namespace internal {

void* FromV8Impl(v8::Isolate* isolate, v8::Local<v8::Value> val) {
  if (!val->IsObject())
    return nullptr;
  v8::Local<v8::Object> obj = v8::Local<v8::Object>::Cast(val);
  if (obj->InternalFieldCount() != 1)
    return nullptr;
  return obj->GetAlignedPointerFromInternalField(0);
}

}  // namespace internal

}  // namespace mate
