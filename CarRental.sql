-- CarRental SQL Server script
CREATE DATABASE CarRental;
GO
USE CarRental;
GO

CREATE TABLE Clients (
    ClientID INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) UNIQUE NOT NULL,
    Passport NVARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE Cars (
    CarID INT IDENTITY PRIMARY KEY,
    Brand NVARCHAR(50) NOT NULL,
    Model NVARCHAR(50) NOT NULL,
    Year INT NOT NULL,
    PricePerDay DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'available'
);

CREATE TABLE Employees (
    EmployeeID INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Position NVARCHAR(50)
);

CREATE TABLE Rentals (
    RentalID INT IDENTITY PRIMARY KEY,
    ClientID INT NOT NULL,
    CarID INT NOT NULL,
    EmployeeID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TotalPrice DECIMAL(10,2),
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID),
    FOREIGN KEY (CarID) REFERENCES Cars(CarID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);

CREATE TABLE Payments (
    PaymentID INT IDENTITY PRIMARY KEY,
    RentalID INT NOT NULL,
    PaymentDate DATE NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);
ALTER TABLE Clients ADD Email NVARCHAR(100) NULL UNIQUE;
ALTER TABLE Clients ADD Password NVARCHAR(255) NULL;

ALTER TABLE Cars ADD ClientID INT NULL;
ALTER TABLE Cars ADD CONSTRAINT FK_Cars_Clients FOREIGN KEY (ClientID) REFERENCES Clients(ClientID);

-- Example data
INSERT INTO Cars (Brand,Model,Year,PricePerDay) VALUES
('Toyota','Camry',2019,45.00),
('Hyundai','Elantra',2020,35.00),
('Kia','Rio',2018,30.00);
GO
