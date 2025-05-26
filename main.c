int add(int *x, int *y) {
  int z=*x+*y;
  return z;
}

int main() {
  int m = 100;
  int n = 500;
  int y=add(&m, &n);
  return (y);  // output=600
}
