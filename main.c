void exchange(int *x, int *y) {
  int temp = *x;
  *x = *y;
  *y = temp;
}

int main() {
  int m = 100;
  int n = 200;
  exchange(&m, &n);
  return (m);  // After swap, m == 200
}
