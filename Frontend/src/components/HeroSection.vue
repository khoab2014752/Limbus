// Create this file at src/components/HeroSection.vue
<template>
  <div class="hero-section">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <h1 class="display-4 fw-bold">
            Khám phá thế giới qua từng trang sách
          </h1>
          <p class="lead my-4">
            Hệ thống quản lý mượn sách hiện đại giúp bạn dễ dàng tiếp cận kho
            tàng tri thức đa dạng.
          </p>
          <div class="d-flex">
            <router-link to="/sach" class="btn btn-primary btn-lg me-3"
              >Khám phá sách</router-link
            >
            <router-link to="/dangky" class="btn btn-outline-primary btn-lg"
              >Đăng ký ngay</router-link
            >
          </div>
        </div>
        <div class="col-lg-6">
          <img
            src=".\src\assets\AdminPage.png"
            alt="Library Illustration"
            class="img-fluid"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HeroSection",
};
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  border-radius: 15px;
  margin-bottom: 30px;
}
</style>
