import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {validator} from '../../utils/validator'
import TextField from '../common/form/textField'
import SelectField from '../common/form/selectField'
import RadioField from '../common/form/radioField'
import MultiSelectField from '../common/form/multiSelectField'
import CheckBoxField from '../common/form/checkBoxField'
import {useQualities} from '../../hooks/useQuality'
import {useProfessions} from '../../hooks/useProfession'
import {useAuth} from '../../hooks/useAuth'

const RegisterForm = () => {
    const history = useHistory()
    const [data, setData] = useState({
        email: '',
        password: '',
        profession: '',
        sex: 'male',
        name: '',
        qualities: [],
        licence: false
    })
    const {signUp} = useAuth()
    const {qualities} = useQualities()
    const qualitiesList = qualities.map(q => ({label: q.name, value: q._id}))
    const {professions} = useProfessions()
    const professionsList = professions.map(prof => ({label: prof.name, value: prof._id}))
    const [errors, setErrors] = useState({})

    const handleChange = (target) => {
        setData((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }))
    }

    const validatorConfig = {
        email: {
            isRequired: {message: 'Электронная почта обязательна для заполнения'},
            isEmail: {message: 'Email введен некорректно'}
        },
        password: {
            isRequired: {message: 'Пароль обязателен для заполнения'},
            isCapitalSymbol: {message: 'Пароль должен содержать хотя бы одну заглавную букву'},
            isContainDigit: {message: 'Пароль должен содержать хотя бы одну цифру'},
            minLength: {message: 'Пароль должен быть не менее 8 символов', value: 8}
        },
        profession: {
            isRequired: {message: 'Обязательно выберите вашу профессию'}
        },
        licence: {
            isRequired: {message: 'Вы не можете использовать наш сервис без подтвержения лицензионного соглашения'}
        },
        name: {
            isRequired: {message: 'Имя обязательно для заполнения'},
            minLength: {message: 'Имя должен быть не менее 3 символов', value: 3}
        }
    }

    useEffect(() => {
        validate()
    }, [data])

    const validate = () => {
        const errors = validator(data, validatorConfig)
        setErrors(errors)
        return Object.keys(errors).length === 0
    }

    const isValid = Object.keys(errors).length === 0

    const handleSubmit = async (event) => {
        event.preventDefault()
        const isValid = validate()
        if (!isValid) return
        const newData = {...data, qualities: data.qualities.map(q => q.value)}
        try {
            await signUp(newData)
            history.push('/')
        } catch (error) {
            setErrors(error)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <TextField
                label="Электронная почта"
                name="email"
                value={data.email}
                onChange={handleChange}
                error={errors.email}
            />
            <TextField
                label="Пароль"
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                error={errors.password}
            />
            <TextField
                label="Имя"
                name="name"
                value={data.name}
                onChange={handleChange}
                error={errors.name}
            />
            <SelectField
                label="Выберите вашу профессию:"
                value={data.profession}
                onChange={handleChange}
                defaultOption="Choose..."
                options={professionsList}
                error={errors.profession}
                name="profession"
            />
            <RadioField
                options={[
                    {name: 'Male', value: 'male'},
                    {name: 'Female', value: 'female'},
                    {name: 'Other', value: 'other'}
                ]}
                label="Выберите ваш пол:"
                value={data.sex}
                name="sex"
                onChange={handleChange}
            />
            <MultiSelectField
                options={qualitiesList}
                label="Выберите ваши качества:"
                onChange={handleChange}
                name="qualities"
                defaultValue={data.qualities}
            />
            <CheckBoxField
                name="licence"
                value={data.licence}
                onChange={handleChange}
                error={errors.licence}
            >
                Подтвердить <a>лицензионное соглашение</a>
            </CheckBoxField>
            <button className="btn btn-primary w-100 mx-auto" type="submit" disabled={!isValid}>Submit</button>
        </form>

    )
}

export default RegisterForm
