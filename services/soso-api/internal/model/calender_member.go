package model

type CalenderMember struct {
	UserID    string `db:"user_id"`
	Username  string `db:"username"`
	HasCar    bool   `db:"has_car"`
	Capacity  int    `db:"capacity"`
	SoSoPoint int    `db:"soso_point"`
}
