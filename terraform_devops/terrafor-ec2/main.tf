terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

###############################
# USE EXISTING SECURITY GROUP
###############################
data "aws_security_group" "web_sg" {
  id = "sg-02f220c37e3654c7c"
}

###############################
# EC2 INSTANCE
###############################
resource "aws_instance" "devops_ec2" {
  ami           = "ami-02eb7a4783e7e9317"
  instance_type = "t3.micro"
  key_name      = "Jenkins key"   
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "DevOps-EC2"
  }
}

output "public_ip" {
  value = aws_instance.devops_ec2.public_ip
}
